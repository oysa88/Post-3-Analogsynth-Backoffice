radio.setGroup(3)
let buttonPin = DigitalPin.P1
let catMuted = false;
let mumMuted = false;
let list = 0
let myOnTime = 0
let myOnTimer = 0
let altTrack = 1 //1 = Zim, 0 = Zam
let poly = false
let midiChannel: midi.MidiController = null
let anOutputIsOn = false
let chan = 0
let notes: number[] = []
let MIDIoffset = 0
let noteOffset = 12
let muted = false
let altOutPut = 0;

pins.setPull(DigitalPin.P1, PinPullMode.PullUp)

function handlePinOuts() {
    pins.digitalWritePin(myPins[myNote], 1)
    anOutputIsOn = true
}

let strip = neopixel.create(DigitalPin.P0, 7, NeoPixelMode.RGB)

function sendMonoMidiViaI2C(port: number) {
    //pins.digitalWritePin(DigitalPin.P4, port)
    if (myNote != 127) {
        myNote += (noteOffset * port)
        // led.toggleAll()
        pins.i2cWriteNumber(0, myNote + (port * 127), NumberFormat.Int8LE) //add 127 to tell proMicro that it is alt port
    }
}

function sendMonoMidi() {
    if (myNote != 127) {
        midiChannel.noteOn(myNote)
        led.toggle(2, 2)
        midiChannel.noteOff(myNote)
    }
}

radio.onReceivedValue(function (name, value) {
    if (name == "TimP") {
        //led.toggleAll()
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
        for (let i = 0; i <= 16 - 1; i++) {
            if (bitCheckMask & value) {
                outPut = i + 48
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
        /*
        Bob 00000001
        Tim 00000010
        Ted 00000100
        Pat 00001000
        Cat 00010000
        Dad 00100000
        Mum 01000000
        Zim 10000000
        */
        if (value & 0b00010000) {
            led.plot(0, 4)
            catMuted = true
            //  basic.showIcon(IconNames.No, 0)
        } else if (catMuted) {
            catMuted = false
            //  basic.clearScreen()
        }

        if (value & 0b01000000) {
            mumMuted = true
            led.plot(4, 4)
        } else if (mumMuted) {
            mumMuted = false
        }
    }
})


//function sendMidi() {
//    MIDIoffset = 48
//    midiChannel.noteOn(myNote + MIDIoffset)
//    // led.toggle(0, 0)
//    midiChannel.noteOff(myNote + MIDIoffset)
//}

input.onButtonPressed(Button.A, () => {
    playCorrectSeq()
    //noteOffset -= 12
    //midiChannel = midi.channel(chan)
})

input.onButtonPressed(Button.B, () => {
    win()
    wrong()
    //noteOffset += 12
    //midiChannel = midi.channel(chan)
})




function handleOutput() {
    if (!mumMuted) {
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

function handleAltOutput() {
    if (!catMuted) {
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

let bitCheckMask = 0
let myNote = 0
poly = false
let outPut = 0
let myPins: number[] = []
basic.showLeds(`
    . . . . #
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
myPins = [9, 15, 20, 21, 22, 23]
list = 0

music.setTempo(200)
let bufferTimer = 10
let timeOut = 6000
let waitingForTimeout = false
basic.forever(() => {
    if (input.runningTime() > myOnTimer) {
        if (!muted) {
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

function reset() {
    wrong()

}

let isExecuting = false
let receiveTime = 0

radio.onReceivedString(function (name) {
    waitingForTimeout = true
    //led.toggleAll()
    if (!isExecuting) {
        //serial.writeLine("pushing")
        receiveTime = input.runningTime()
        commands.push(name)
    }
})


let thisCommand = ""
let commands: string[] = []
let numberOfCommands = 0
let messageHasAlreadyFailed = false
let thisColour = 0
function executeCommands() {
    serial.writeLine("EXECUTE")
    isExecuting = true
    numberOfCommands = commands.length
    //serial.writeValue("numberOfCommands", numberOfCommands)
    messageHasAlreadyFailed = false
    for (let index = 0; index < numberOfCommands; index++) {
        thisCommand = commands.shift()
        serial.writeLine(thisCommand)
        for (let y = 0; y < thisCommand.length; y++) {
            let thisSubCommand = thisCommand.substr(y, 1)
            //serial.writeLine(thisSubCommand)            
            //play sounds:            
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
                completion++
                handleCompletion(completion)
            } else {
                if (!messageHasAlreadyFailed) {
                    basic.pause(250)
                    //wrong()
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
let Cnum = 60
let Dnum = 62
let Enum = 64
let Fnum = 65
let Gnum = 67
let Anum = 69
let Bnum = 71
let correctSeq: string[] = ["C", "F", "A", "E", "G", "D", "C"]
let completion = 0
let alreadyCorrect: number[] = []
let correctSeqNumbers: number[] = [Cnum, Fnum, Anum, Enum, Gnum, Dnum, Cnum]
let correctSeqPixels: number[] = [0, 3, 5, 2, 4, 1, 0]
let playSpeed = 600


function playCorrectSeq() {
    for (let i = 0; i < correctSeqNumbers.length; i++) {
        outPut = correctSeqNumbers[i]
        strip.setPixelColor(correctSeqPixels[i], neopixel.rgb(0, 255, 0))
        strip.show()
        handleOutput()
        basic.pause(playSpeed)
        strip.clear()
        strip.show()
    }
}

function handleCompletion(step: number) {
    //for(let i = 0; i<step; i++){
    //    strip.setPixelColor(i,neopixel.rgb(0, 255, 0))
    //}
    strip.show()
    if (completion == correctSeq.length) {
        if (!messageHasAlreadyFailed) {
            basic.pause(300)
            win()
        }
    }
}

function win() {
    for (let i = 0; i < 7; i++) {
        strip.setPixelColor(i, neopixel.rgb(0, 255, 0))
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
    control.reset()
}

function wrong() {
    for (let i = 0; i < 7; i++) {
        strip.setPixelColor(i, neopixel.rgb(255, 0, 0))
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
    for (let i = 0; i < 7; i++) {
        strip.setPixelColor(i, neopixel.rgb(0, 0, 0))
    }
    completion = 0
    waitingForTimeout = false;
}

function testStrip() {
    strip.showRainbow()
    strip.show()
    basic.pause(500)
    strip.clear()
    strip.show()
}