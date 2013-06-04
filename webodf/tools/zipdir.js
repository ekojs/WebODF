/**
 * Copyright (C) 2013 KO GmbH <jos.van.den.oever@kogmbh.com>
 * @licstart
 * The JavaScript code in this page is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.  The code is distributed
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.
 *
 * As additional permission under GNU AGPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * As a special exception to the AGPL, any HTML file which merely makes function
 * calls to this code, and for that purpose includes it by reference shall be
 * deemed a separate work for copyright law purposes. In addition, the copyright
 * holders of this code give you permission to combine this code with free
 * software libraries that are released under the GNU LGPL. You may copy and
 * distribute such a system following the terms of the GNU AGPL for this code
 * and the LGPL for the libraries. If you modify this code, you may extend this
 * exception to your version of the code, but you are not obligated to do so.
 * If you do not wish to do so, delete this exception statement from your
 * version.
 *
 * This license applies to this entire compilation.
 * @licend
 * @source: http://www.webodf.org/
 * @source: http://gitorious.org/webodf/webodf/
 */

/*global require, console, runtime, core*/

runtime.loadClass("core.Zip");

var directory = process.argv[3],
    zipfile = process.argv[4];

function zipdirectory(zipfile, directory) {
    "use strict";
    var fs = require('fs'),
        path = require('path'),
        stat,
        list;
    function listFiles(directory, basename, list) {
        var l = fs.readdirSync(directory),
            i;
        l.forEach(function (f) {
            var abspath = path.join(directory, f),
                relpath = path.join(basename, f),
                stat = fs.lstatSync(abspath);
            if (stat.isDirectory(abspath)) {
                listFiles(abspath, relpath, list);
            } else {
                list.push(relpath);
            }
        });
    }
    function zipFile(zip, abspath, relpath) {
        var entry = {}, data;
        entry.path = relpath;
        entry.date = new Date();
        runtime.log(abspath);
        data = runtime.readFileSync(abspath, "binary");
        runtime.log("[" + zip.filename + "] << \"" + entry.path + "\"");
        zip.save(entry.path, data, false, entry.date);
    }
    function zipList(directory, zipfilepath, list) {
        var base = path.dirname(directory),
            zip = new core.Zip(zipfilepath, null),
            i;
        for (i = 0; i < list.length; i += 1) {
            zipFile(zip, path.join(base, list[i]), list[i]);
        }
        zip.write(function (err) {
            if (err) {
                runtime.log(err);
            }
        });
    }

    if (!fs.existsSync(directory)) {
        throw "Directory " + directory + " does not exist.";
    }
    stat = fs.lstatSync(directory);
    if (!stat.isDirectory()) {
        throw directory + " is not a directory.";
    }
    list = [];
    listFiles(directory, path.basename(directory), list);
    if (list.length === 0) {
        throw "Directory " + directory + " is empty.";
    }
    if (fs.existsSync(zipfile)) {
        runtime.log("Deleting " + zipfile);
        fs.unlinkSync(zipfile);
    }
    zipList(directory, zipfile, list);
    runtime.log("Created " + zipfile);
}
zipdirectory(zipfile, directory);