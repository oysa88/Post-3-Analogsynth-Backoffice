function RiktigLøsning () {
    Lysstyrke = 255
    for (let index = 0; index < 3; index++) {
        for (let index = 0; index < 20; index++) {
            Lysstyrke += -12
            strip.showColor(neopixel.colors(NeoPixelColors.Green))
            strip.setBrightness(Lysstyrke)
            strip.show()
            basic.pause(5)
        }
        for (let index = 0; index < 20; index++) {
            Lysstyrke += 12
            strip.showColor(neopixel.colors(NeoPixelColors.Green))
            strip.setBrightness(Lysstyrke)
            strip.show()
            basic.pause(5)
        }
    }
    radio.sendString("R")
    basic.pause(2000)
    Initialize()
}
input.onButtonPressed(Button.A, function () {
    radio.sendString("C")
    radio.sendString("B")
    radio.sendString("A")
    radio.sendString("D")
})
function Spille_på_flaskene () {
    if (Synth == "C") {
        basic.showString("C")
        basic.pause(100)
    } else if (Synth == "D") {
        basic.showString("D")
        basic.pause(100)
    } else if (Synth == "E") {
        basic.showString("E")
        basic.pause(100)
    } else if (Synth == "F") {
        basic.showString("F")
        basic.pause(100)
    } else if (Synth == "G") {
        basic.showString("G")
        basic.pause(100)
    } else if (Synth == "A") {
        basic.showString("A")
        basic.pause(100)
    } else if (Synth == "H") {
        basic.showString("H")
        basic.pause(100)
    }
}
function FeilLøsning () {
    Lysstyrke = 255
    for (let index = 0; index < 3; index++) {
        for (let index = 0; index < 20; index++) {
            Lysstyrke += -12
            strip.showColor(neopixel.colors(NeoPixelColors.Red))
            strip.setBrightness(Lysstyrke)
            strip.show()
            basic.pause(5)
        }
        for (let index = 0; index < 20; index++) {
            Lysstyrke += 12
            strip.showColor(neopixel.colors(NeoPixelColors.Red))
            strip.setBrightness(Lysstyrke)
            strip.show()
            basic.pause(5)
        }
    }
    basic.pause(2000)
    Initialize()
}
radio.onReceivedString(function (receivedString) {
    Synth = receivedString
    Mottatt += 1
    Spille_på_flaskene()
    // eller hva det er du har bedt de skrive
    if (Synth == riktigSekvens[fremskritt]) {
        fremskritt += 1
    } else {
        fremskritt = 0
        if (Mottatt == riktigSekvens.length) {
            FeilLøsning()
        }
    }
    // her havner vi når vi har mottat hele sekvensen i riktig rekkefølge
    if (fremskritt == riktigSekvens.length) {
        RiktigLøsning()
    }
})
input.onButtonPressed(Button.B, function () {
    radio.sendString("C")
    radio.sendString("B")
    radio.sendString("A")
    radio.sendString("A")
})
function Initialize () {
    Lysstyrke = 255
    fremskritt = 0
    Mottatt = 0
    strip.showColor(neopixel.colors(NeoPixelColors.Yellow))
}
let Synth = ""
let Lysstyrke = 0
let Mottatt = 0
let strip: neopixel.Strip = null
let riktigSekvens: string[] = []
let fremskritt = 0
fremskritt = 0
riktigSekvens = ["C", "B", "A", "D"]
strip = neopixel.create(DigitalPin.P0, 16, NeoPixelMode.RGB)
Mottatt = 0
radio.setGroup(1)
Initialize()
