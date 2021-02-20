const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const fs = require('fs')

// How to update the given file after a new version is found (?)

// const url = "https://debian.beagleboard.org/images"
// const imageName = "bone-debian-10.3-iot-armhf-2020-04-06-4gb.img.xz"
var reg = "bone-debian-(?<version>[0-9]+\.[0-9]+)-iot-armhf-(?<date>[0-9]{4}-[0-9]{2}-[0-9]{1,2})-4gb.img.xz$"

// Read the input file, and parse the variable input
try {
    const data = fs.readFileSync('test/run-tests.sh', 'utf8')
          .split('\n')
          .filter(line => line.match("BBB_DEBIAN_SDCARD_IMAGE_URL=.*"))
    var line = data[0]
    console.log(line)
    var m = line.match(".*=\"(?<url>[a-zA-Z-://\._]*)(?<imageName>bone-debian-(?<version>[0-9]+\.[0-9]+)-iot-armhf-(?<date>[0-9]{4}-[0-9]{2}-[0-9]{1,2})-4gb.img.xz)")
    console.log(m)
    var url = m.groups.url
    var imageName = m.groups.imageName
    var version = m.groups.version
    var date = m.groups.date
} catch (err) {
    console.error(err)
    process.exit(1)
}

// The bone-debian setup has two parts which needs comparing:
// * The release-version: i.e., 10.3
// * The date: i.e., 2020-04-06

JSDOM.fromURL(url, {}).then(dom => {
    var document = dom.window.document;
    var table = document.getElementById("list");
    var rows = table.rows;
    var matches = [];
    for (var i=0; i< rows.length; i++) {
        var rowText = rows[i].firstChild.textContent;
        var regMatch = rowText.match(reg);
        if (regMatch) {
            matches.push({
                text: rowText,
                version: regMatch.groups.version,
                date: regMatch.groups.date,
            });
        }
    }
    // Sort the accumulated matches
    matches.sort(function(a,b) {
        let al = parseFloat(a.version);
        let bl = parseFloat(b.version);
        if (al == bl) {
            let ad = Date.parse(a.date);
            let bd = Date.parse(b.date);
            return bd - ad;
        }
        return parseFloat(b.version) - parseFloat(a.version);
    });
    console.log(matches[0].text)
    if (matches[0].text !== imageName) {
        console.log("We've got a new release! \\o/");
        console.log("BBB_DEBIAN_SDCARD_IMAGE_URL=${url}/${matches[0].text}")
        updateURLLink("BBB_DEBIAN_SDCARD_IMAGE_URL=\"${url}/${matches[0].text}\"")
    }
});

function updateURLLink(newLine) {
    console.error("Updating the variable")
    try {
        const data = fs.readFileSync('test/run-tests.sh', 'utf8').replace(/## Auto-update\nBBB_DEBIAN_SDCARD_IMAGE_URL=.*/, `## Auto-update\n${newLine}\n`)
        fs.writeFile('test/run-tests.sh', data, (err, data) => {
            if (err) {
                console.error(err)
            }
        })
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}
