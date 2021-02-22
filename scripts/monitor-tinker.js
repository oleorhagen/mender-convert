const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const fs = require('fs')

const url = "https://www.asus.com/us/Single-Board-Computer/Tinker-Board/"
const reg = "(?<image>http://dlcdnet.asus.com/pub/ASUS/mb/Linux/Tinker_Board_2GB/(?<date>[0-9]{8})-tinker-board-linaro-stretch-alip-v(?<version>[0-9]\.[0-9]).zip)"

// Read the input file, and parse the variable input
try {
    const data = fs.readFileSync('test/run-tests.sh', 'utf8')
          .split('\n')
          .filter(line => line.match("TINKER_IMAGE_URL=.*"))
    var line = data[0]
    var m = line.match(`.*=\"${reg}`)
    var imageName = m[0]
    var date = m.groups.date
    var version = m.groups.version
} catch (err) {
    console.error(err)
    process.exit(1)
}

JSDOM.fromURL(url, {}).then(dom => {
    var document = dom.window.document;
    var section = document.getElementById("tinker-board-Download");
    var boards = section.getElementsByTagName("b")
    for (var i=0; i<boards.length; i++) {
        if (boards[i].textContent == "TinkerOS-Debian") {
            var newRef = boards[i].parentElement.href
            var regNewMatch = newRef.match(reg)
            var regOldMatch = imageName.match(reg)
            let vn = parseFloat(regNewMatch.groups.version)
            let vo = parseFloat(regOldMatch.groups.version)
            if (vn > vo) {
                console.error("A new version has been released \\o/")
                var newImage = regNewMatch[0]
                updateURLLink(`TINKER_IMAGE_URL=\"${newImage}\"`)
                break;
            } else if ( vn == vo ) {
                let dn = parseInt(regNewMatch.groups.date)
                let _do = parseInt(regOldMatch.groups.date)
                if (dn > _do) {
                    console.error("A newer version has been released \\o/")
                    var newImage = regNewMatch[0]
                    updateURLLink(`TINKER_IMAGE_URL=\"${newImage}\"`)
                    break
                }
            }
            break;
        }
    }
});

function updateURLLink(newLine) {
    try {
        const data = fs.readFileSync('test/run-tests.sh', 'utf8').replace(/## Auto-update\nTINKER_IMAGE_URL=.*/, `## Auto-update\n${newLine}\n`)
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
