function wrong () {
    for (let m = 0; m <= 6; m++) {
        strip.setPixelColor(m, neopixel.rgb(255, 0, 0))
    }
    strip.show()
    outPut = 42
    handleOutput()
    basic.pause(100)
    outPut = 38
    handleOutput()
    basic.pause(100)
    basic.pause(500)
    strip.clear()
    strip.show()
    for (let n = 0; n <= 6; n++) {
        strip.setPixelColor(n, neopixel.rgb(0, 0, 0))
    }
    completion = 0
    waitingForTimeout = false
}
function executeCommands () {
    serial.writeLine("EXECUTE")
    isExecuting = true
    numberOfCommands = commands.length
    // serial.writeValue("numberOfCommands", numberOfCommands)
    messageHasAlreadyFailed = false
    for (let index = 0; index < numberOfCommands; index++) {
        thisCommand = commands.shift()
        serial.writeLine("" + (thisCommand))
        for (let y = 0; y <= thisCommand.length - 1; y++) {
            thisSubCommand = thisCommand.substr(y, 1)
            // serial.writeLine(thisSubCommand)
            // play sounds:
            if (thisSubCommand == correctSeq[completion]) {
                thisColour = neopixel.rgb(0, 255, 0)
            } else {
                thisColour = neopixel.rgb(255, 0, 0)
            }
            strip.clear()
            switch (thisSubCommand) {
                case "C": {
                    strip.setPixelColor(0, thisColour)
                    strip.show()
                    outPut = 60
                    handleOutput()
                    break;
                }
                case "D": {
                    strip.setPixelColor(1, thisColour)
                    strip.show()
                    outPut = 62
                    handleOutput()
                    break;
                }
                case "E": {
                    strip.setPixelColor(2, thisColour)
                    strip.show()
                    outPut = 64
                    handleOutput()
                    break;
                }
                case "F": {
                    strip.setPixelColor(3, thisColour)
                    strip.show()
                    outPut = 65
                    handleOutput()
                    break;
                }
                case "G": {
                    strip.setPixelColor(4, thisColour)
                    strip.show()
                    outPut = 67
                    handleOutput()
                    break;
                }
                case "A": {
                    strip.setPixelColor(5, thisColour)
                    strip.show()
                    outPut = 69
                    handleOutput()
                    break;
                }
                case "B": {
                    strip.setPixelColor(6, thisColour)
                    strip.show()
                    outPut = 71
                    handleOutput()
                    break;
                }

                default: {
                    break;
                }

            }
strip.show()
            basic.pause(playSpeed)
            if (thisSubCommand == correctSeq[completion]) {
                completion += 1
                handleCompletion(completion)
            } else {
                // wrong()
                if (!(messageHasAlreadyFailed)) {
                    basic.pause(250)
                }
                messageHasAlreadyFailed = true
                break;
            }
        }
    }
    strip.clear()
    strip.show()
    isExecuting = false
    if (messageHasAlreadyFailed) {
        wrong()
    }
    messageHasAlreadyFailed = false
    serial.writeValue("numberOfCommandsAfter", numberOfCommands)
}
function handleCompletion (step: number) {
    // for(let i = 0; i<step; i++){
    // strip.setPixelColor(i,neopixel.rgb(0, 255, 0))
    // }
    strip.show()
    if (completion == correctSeq.length) {
        if (!(messageHasAlreadyFailed)) {
            basic.pause(300)
            win()
        }
    }
}
function sendMonoMidi () {
    if (myNote != 127) {
        midiChannel.noteOn(myNote)
        led.toggle(2, 2)
        midiChannel.noteOff(myNote)
    }
}
/**
 * function sendMidi() {
 * 
 * MIDIoffset = 48
 * 
 * midiChannel.noteOn(myNote + MIDIoffset)
 * 
 * // led.toggle(0, 0)
 * 
 * midiChannel.noteOff(myNote + MIDIoffset)
 * 
 * }
 */
// noteOffset -= 12
// midiChannel = midi.channel(chan)
input.onButtonPressed(Button.A, function () {
    playCorrectSeq()
})
function win () {
    for (let l = 0; l <= 6; l++) {
        strip.setPixelColor(l, neopixel.rgb(0, 255, 0))
    }
    strip.show()
    outPut = 72
    handleOutput()
    basic.pause(100)
    outPut = 84
    handleOutput()
    basic.pause(100)
    outPut = 96
    handleOutput()
    basic.pause(1000)
    strip.clear()
    strip.show()
    completion = 0
    radio.sendString("K")
}
function handlePinOuts () {
    pins.digitalWritePin(myPins[myNote], 1)
anOutputIsOn = true
}
function handleAltOutput () {
    if (!(catMuted)) {
        led.plot(altOutPut % 5, 0)
        led.plot(altOutPut % 5, 1)
        led.plot(altOutPut % 5, 2)
        led.plot(altOutPut % 5, 3)
        led.plot(altOutPut % 5, 4)
        myOnTimer = input.runningTime() + myOnTime
        myNote = altOutPut
        sendMonoMidiViaI2C(1)
    }
}
// noteOffset += 12
// midiChannel = midi.channel(chan)
input.onButtonPressed(Button.B, function () {
    win()
    wrong()
})
function playCorrectSeq () {
    for (let k = 0; k <= correctSeqNumbers.length - 1; k++) {
        outPut = correctSeqNumbers[k]
        strip.setPixelColor(correctSeqPixels[k], neopixel.rgb(0, 255, 0))
        strip.show()
        handleOutput()
        basic.pause(playSpeed)
        strip.clear()
        strip.show()
    }
}
function handleOutput () {
    if (!(mumMuted)) {
        led.plot(0, outPut % 5)
        led.plot(1, outPut % 5)
        led.plot(2, outPut % 5)
        led.plot(3, outPut % 5)
        led.plot(4, outPut % 5)
        myOnTimer = input.runningTime() + myOnTime
        myNote = outPut
        sendMonoMidiViaI2C(0)
    }
}
radio.onReceivedValue(function (name, value) {
    if (name == "TimP") {
        // led.toggleAll()
        bitCheckMask = 1
        for (let i = 0; i <= 16 - 1; i++) {
            if (bitCheckMask & value) {
                altOutPut = i + 48
                // outPut = 15-i //add this to flip output!
                handleAltOutput()
            }
            bitCheckMask = bitCheckMask << 1
        }
    }
    if (name == "TedP") {
        bitCheckMask = 1
        for (let j = 0; j <= 16 - 1; j++) {
            if (bitCheckMask & value) {
                outPut = j + 48
                // outPut = 15-i //add this to flip output!
                handleOutput()
            }
            bitCheckMask = bitCheckMask << 1
        }
    }
    if (name == "Spill") {
        outPut = value
        if (outPut != 0 && altOutPut < 127) {
            handleOutput()
        }
    }
    if (name == "Tim") {
        altOutPut = value
        if (outPut != 0 && outPut < 127) {
            handleAltOutput()
        }
    }
    if (name == "m") {
        // Bob 00000001
        // Tim 00000010
        // Ted 00000100
        // Pat 00001000
        // Cat 00010000
        // Dad 00100000
        // Mum 01000000
        // Zim 10000000
        // 
        // basic.showIcon(IconNames.No, 0)
        // basic.clearScreen()
        if (value & 0b00010000) {
            led.plot(0, 4)
            catMuted = true
        } else if (catMuted) {
            catMuted = false
        }
        if (value & 0b01000000) {
            mumMuted = true
            led.plot(4, 4)
        } else if (mumMuted) {
            mumMuted = false
        }
    }
})
function testStrip () {
    strip.showRainbow(0, 0)
    strip.show()
    basic.pause(500)
    strip.clear()
    strip.show()
}
radio.onReceivedString(function (name) {
    waitingForTimeout = true
    // led.toggleAll()
    if (!(isExecuting)) {
        // serial.writeLine("pushing")
        receiveTime = input.runningTime()
        commands.push(name)
    }
})
function sendMonoMidiViaI2C (port: number) {
    // pins.digitalWritePin(DigitalPin.P4, port)
    if (myNote != 127) {
        myNote += noteOffset * port
        // led.toggleAll()
        // add 127 to tell proMicro that it is alt port
        pins.i2cWriteNumber(
        0,
        myNote + port * 127,
        NumberFormat.Int8LE,
        false
        )
    }
}
function reset () {
    wrong()
}
let receiveTime = 0
let mumMuted = false
let myOnTimer = 0
let altOutPut = 0
let catMuted = false
let anOutputIsOn = false
let thisCommand = ""
let messageHasAlreadyFailed = false
let commands: string[] = []
let numberOfCommands = 0
let isExecuting = false
let waitingForTimeout = false
let completion = 0
let playSpeed = 0
let correctSeqPixels: number[] = []
let correctSeqNumbers: number[] = []
let correctSeq: string[] = []
let myOnTime = 0
let midiChannel: midi.MidiController = null
let noteOffset = 0
let list = 0
let poly = false
let chan = 0
let notes: number[] = []
let MIDIoffset = 0
let bitCheckMask = 0
let myNote = 0
let outPut = 0
let myPins: number[] = []
let thisColour = 0
let alreadyCorrect: number[] = []
let strip: neopixel.Strip = null
let thisSubCommand = ""
radio.setGroup(3)
let buttonPin = DigitalPin.P1
// 1 = Zim, 0 = Zam
let altTrack = 1
noteOffset = 12
pins.setPull(DigitalPin.P1, PinPullMode.PullUp)
strip = neopixel.create(DigitalPin.P0, 7, NeoPixelMode.RGB)
basic.showLeds(`
    . . . . .
    . # . . .
    . # # . .
    . # # # .
    . . . . .
    `)
basic.pause(500)
midi.useRawSerial()
midiChannel = midi.channel(1)
midiChannel.setInstrument(MidiInstrument.AcousticGrandPiano)
myOnTime = 15
myPins = [
9,
15,
20,
21,
22,
23
]
music.setTempo(200)
let bufferTimer = 10
let timeOut = 6000
let Cnum = 60
let Dnum = 62
let Enum = 64
let Fnum = 65
let Gnum = 67
let Anum = 69
let Bnum = 71
correctSeq = [
"C",
"F",
"A",
"E",
"G",
"D",
"C"
]
correctSeqNumbers = [
Cnum,
Fnum,
Anum,
Enum,
Gnum,
Dnum,
Cnum
]
correctSeqPixels = [
0,
3,
5,
2,
4,
1,
0
]
playSpeed = 600
basic.forever(function () {
    if (input.runningTime() > myOnTimer) {
        let muted = 0
        if (!(muted)) {
            basic.clearScreen()
        } else {
            basic.showIcon(IconNames.No, 1)
        }
        led.plot(0, 0)
        anOutputIsOn = false
    }
    if (input.runningTime() > receiveTime + bufferTimer && commands.length > 0 && !(isExecuting)) {
        executeCommands()
    }
    if (waitingForTimeout) {
        if (input.runningTime() > receiveTime + timeOut) {
            reset()
        }
    }
    if (pins.digitalReadPin(buttonPin) == 0) {
        completion = 0
        playCorrectSeq()
    }
})
