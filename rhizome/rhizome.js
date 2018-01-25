'use strict';
let $ = id => document.getElementById(id);

class Setting {
    constructor(name, defaultSetting) {
        this.name = name;
        this.default = defaultSetting;
        if(localStorage.getItem(this.name)) {
            this.setting = localStorage.getItem(this.name);
        } else {
            this.setting = this.default;
            localStorage.setItem(this.name,this.default);
        }
    }
    set(setting) {
        this.setting = setting;
        localStorage.setItem(this.name,setting);
    }
    get() {
        return this.setting;
    }
    is(value) {
        return this.setting === value;
    }
}
class Position {
    constructor(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    distance(position) {
        return Math.sqrt(
            Math.pow(this.x - position.x, 2) +
            Math.pow(this.y - position.y, 2) +
            Math.pow(this.z - position.z, 2) 
        );
    }
    distanceVector(body) {
        return new Position(this.x - body.x,this.y - body.y,this.z - body.z);
    }
    add(other) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
    }
    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
    }
}
class Velocity extends Position {
    slow(amount) {
        this.x = this.x-(this.x*amount);
        this.y = this.y-(this.y*amount);
        this.z = this.z-(this.z*amount);
    }
}

/***AUDIO
    *****/
    let ctx = new window.AudioContext();
    let limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = 0.0; 
    limiter.knee.value = 0.0; 
    limiter.ratio.value = 20.0; 
    limiter.attack.value = 0.001; 
    limiter.release.value = 0.050;
    limiter.connect(ctx.destination);

    let masterGain = ctx.createGain();
    masterGain.gain.value = 0.99;
    masterGain.connect(limiter); 

    let pinkNoise = (()=>{
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        let node = ctx.createScriptProcessor(4096, 1, 1);
        node.onaudioprocess = function(e) {
            let output = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < 4096; i++) {
                let white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11;
                b6 = white * 0.115926;
            }
        };
        return node;
    })();
    let noiseLevel = ctx.createGain();
    noiseLevel.gain.value = 0;
    noiseLevel.connect(masterGain);
    pinkNoise.connect(noiseLevel);

    let delay1 = ctx.createDelay(100);
    let delay2 = ctx.createDelay(100);
    let delay3 = ctx.createDelay(100);
    let delayFeedback = ctx.createGain();
    let delayBypass = ctx.createGain();
    let spaceGain = ctx.createGain();
        delay1.delayTime.value = 1+Math.random();
        delay2.delayTime.value = Math.random();
        delay3.delayTime.value = 3*Math.random();
        delayFeedback.gain.value = 0.3;
        delayBypass.gain.value = 1;
        masterGain.connect(delay1);
        masterGain.connect(delay2);
        masterGain.connect(delay2);
        delay1.connect(delayFeedback);
        delay2.connect(delayFeedback);
        delay3.connect(delayFeedback);
        delayFeedback.connect(delay1);
        delayFeedback.connect(delay2);
        delayFeedback.connect(delay3);
        delay1.connect(delayBypass);
        delay2.connect(delayBypass);
        delay3.connect(delayBypass);
        delayBypass.connect(spaceGain);
        spaceGain.connect(ctx.destination);

/***VARIABLES
    *********/
    let speed = 10;
    let scale = 1;
    let volume = 40;//8;
    let feedback = 50;
    let zoom = 1;
    let size = 3;
    let rhizomes = [];
    let multiplicities = [];
    let isPaused = false;
    let isArp = false;
    let tArp = true;
    let show = true;
    let center = new Position(300,300,0);
    let origin = new Position(0,0,0);
    let mousePosition = null;
    let d;

/***MODES
    *****/
    let tunings = {
        rnd: 'rnd',
        pure: 'pure',
        pythagorean: 'pythagorean',
        quarterTone: 'quarterTone',
        regular: 'regular',
        minor: 'minor',
        tetrachord: 'tetrachord',
        hijaz: 'hijaz',
        jin: 'jin',
        phrygian: 'phrygian',
        penta: 'penta',
    };
    let waves = {
        sin: 'sine',
        tri: 'sine',
        saw: 'sawtooth',
        sqr: 'square'
    };

/***SETTINGS
    ********/
    let wave = new Setting('wave', 'sin');
    let tuning = new Setting('tuning', 'rnd');
    let arp = new Setting('arp', '0');
    let lopass = new Setting('lopass', '330');
    let tune = new Setting('tune', '476');
    let detune = new Setting('detune', '0');
    let flutter = new Setting('flutter', '0');
    let space = new Setting('space', '0');
    let number = new Setting('number', '5');
    let gravity = new Setting('gravity', '30');
    let fm = new Setting('fm', '160');
    let noise = new Setting('noise', '10');
    let master = new Setting('master', '300');
    let follow = new Setting('follow', '1');
    let tail = new Setting('tail', '0');
    let massive = new Setting('massive', "0");
    let connecting = new Setting('connecting', "0");
    let lines = new Setting('lines', "0");
    let positioning = new Setting('positioning', "0");
    let sub = new Setting('sub', "0");
    let subFeedback = new Setting('subFeedback', "0");

/***TUNINGS
    *******/
    let pure = _pure(tune.get());
    let pythagorean = _pythagorean(tune.get());
    let quarterTone = _quarterTone(tune.get());
    let regular = _regular(tune.get());
    let minor = _minor(tune.get());
    let tetrachord = _tetrachord(tune.get());
    let hijaz = _hijaz(tune.get());
    let jin = _jin(tune.get());
    let phrygian = _phrygian(tune.get());
    let penta = _penta(tune.get());

class Rhizome {
    constructor(position, direction, initialMass) {
        this.identity = Math.random();
        this.position = position;
        this.direction = direction;
        this.initialMass = initialMass;
        this.connections = [];
        this.frequency = 0;
        this.energy = 1;
        this.clock = 0;
        this.path = [];
        this.connectionLine = [];
        this.createAudio();
        this.initialize();
    }
    createAudio() {
        this.feedback = ctx.createGain();
        this.oscillator = ctx.createOscillator();
            this.oscillator.frequency.value = this.frequency; 
        this.uniOscillator = ctx.createOscillator();
            this.uniOscillator.frequency.value = this.frequency+this.identity*2-1;
        this.subOscillator = ctx.createOscillator();
            this.subOscillator.frequency.value = this.frequency/2;  
            
        this.gain = ctx.createGain();
            this.gain.gain.value = 0;
        this.filter = ctx.createBiquadFilter();
            this.filter.type = "lowpass";
            this.filter.gain.setTargetAtTime(2, ctx.currentTime + 1, 0.5);
        this.pan = ctx.createStereoPanner();
        this.lfo = ctx.createOscillator();
            this.lfo.frequency.value = this.identity;
            this.flutter = ctx.createGain();
            this.flutter.gain.value = 10;
            this.lfo.connect(this.flutter);

        this.oscillator.connect(this.gain);
        this.uniOscillator.connect(this.gain);        
        this.subGain = ctx.createGain();
        this.subGain.gain.value = 0;
        this.subOscillator.connect(this.subGain);
        this.subFeedback = ctx.createGain();
        this.subOscillator.connect(this.subFeedback);
        this.uniOscillator.connect(this.subFeedback);
        this.subFeedback.connect(this.oscillator.frequency);

        this.flutter.connect(this.oscillator.frequency);
        this.gain.connect(this.filter);
        this.subGain.connect(this.filter);
        this.filter.connect(this.pan);
        this.pan.connect(masterGain);
        this.oscillator.start();
        this.uniOscillator.start();
        this.subOscillator.start();
        this.lfo.start();
    }
    initialize() {
        this.setFeedback();
        this.setSub();
        this.setSubFeedback();
        this.initializeFrequency();
        this.setLopass();
        this.setDetune();
        this.setType();
        this.setGain();
        this.setPan();    
        this.setFlutter();
        this.draw();
        this.drawPath();
        this.setSize();
    }
    get multiplicity() {
        return this.connections.length + 1;
    }
    get lastConnection() {
        return this.connections[this.connections.length-1];
    }
    get mass() {
        return 1 * this.identity + this.initialMass;
    }
    get size() {
        return (size * (massive.is("1") ? this.mass : 1))/zoom;
    }
    setType() {
        this.oscillator.type = waves[wave.get()];
        this.uniOscillator.type = waves[wave.get()];
        this.subOscillator.type = waves[wave.get()];
    }
    setFreq(freq) {
        this.frequency = freq;
        this.oscillator.frequency.value = freq;
        this.uniOscillator.frequency.value = freq+this.identity*2-1;
        this.subOscillator.frequency.value = freq/2;
    }
    setGain() {
        this.gain.gain.setTargetAtTime((volume/(rhizomes.length+1))/(this.position.distance(center)+20), ctx.currentTime + 0.5, 0.5);
    }
    setSub() {
        this.subGain.gain.setTargetAtTime(sub.get()/10000, ctx.currentTime + 0.2, 0.5);
    }
    setSubFeedback() {
        this.subFeedback.gain.setTargetAtTime(subFeedback.get()*2, ctx.currentTime + 0.1, 0.5);        
    }
    setLopass() {
        this.filter.frequency.setValueAtTime(200 * this.identity + (this.frequency * (parseInt(lopass.get()) /1000))*6, ctx.currentTime+0.5);
    }
    setPan() {
        this.pan.pan.setValueAtTime( 
            (this.position.x - center.x)/200 < -1 ? -1 : 
            (this.position.x - center.x)/200 > 1 ? 1 : 
            (this.position.x - center.x)/200 ,ctx.currentTime
        );
    }
    setFlutter() {
        this.flutter.gain.setValueAtTime( 
            flutter.get()/100,ctx.currentTime
        );
    }
    setDetune() {
        this.oscillator.detune.setValueAtTime(this.identity * 0.1 * detune.get(), ctx.currentTime);
        this.uniOscillator.detune.setValueAtTime(this.identity * 0.1 * detune.get(), ctx.currentTime);
        this.subOscillator.detune.setValueAtTime(this.identity * 0.1 * detune.get(), ctx.currentTime);
    }
    initializeFrequency() {
        this.setFreq(
            tuning.is('pythagorean') ? pythagorean[Math.floor(Math.random()*(pythagorean.length-1))] :
            tuning.is('pure') ? pure[Math.floor(Math.random()*(pure.length-1))] :
            tuning.is('quaterTone') ? quarterTone[Math.floor(Math.random()*quarterTone.length)] :
            tuning.is('regular') ? regular[Math.floor(Math.random()*regular.length)] :
            tuning.is('minor') ? minor[Math.floor(Math.random()*minor.length)] :
            tuning.is('tetrachord') ? tetrachord[Math.floor(Math.random()*tetrachord.length)] :
            tuning.is('hijaz') ? hijaz[Math.floor(Math.random()*hijaz.length)] :
            tuning.is('jin') ? jin[Math.floor(Math.random()*jin.length)] :
            tuning.is('phrygian') ? phrygian[Math.floor(Math.random()*phrygian.length)] :
            tuning.is('penta') ? penta[Math.floor(Math.random()*penta.length)] :
            Math.round(Math.random()*tune.get())
        );
    }
    setFeedback() {
        if(this.connections.length > 0) {
            this.feedback.gain.setTargetAtTime(this.position.distance(this.connections[0].position)*(fm.get()/2000), ctx.currentTime, 0.5);           
        }
    }
    gravitate() {
        if(this.connections.length > 0) {
            this.connections.forEach(function(connection) {
                this.attract(connection, connecting.is("1"));
            }, this);
            rhizomes.forEach(function(rhizome) {
                if(this.multiplicity != rhizome.multiplicity) {
                    this.attract(rhizome, false);
                }   
            }, this);
        } else if(rhizomes.length > 1) {
            rhizomes.forEach(function(rhizome) {
                if(this.position.x !== rhizome.position.x) {
                    this.attract(rhizome, false);
                    if(this.position.distance(rhizome.position) < size*4) {
                        this.connect(rhizome);
                    }
                }
            }, this);
        }
        this.position.add(this.direction);
        this.move(this.position);
    }
    attract(attractor, connected) {     
        let distance = this.position.distance(attractor.position);
        let distanceVector = this.position.distanceVector(attractor.position);
        let massScalar = massive.is("1") ? attractor.mass/this.mass : 1;
        if(distance > 4*size) {
            this.direction.subtract(new Velocity(       
                distanceVector.x*(massScalar/(connected ? gravity.get() / Math.PI : gravity.get()))/Math.pow(distance,2),
                distanceVector.y*(massScalar/(connected ? gravity.get() / Math.PI : gravity.get()))/Math.pow(distance,2),
                distanceVector.z*(massScalar/(connected ? gravity.get() / Math.PI : gravity.get()))/Math.pow(distance,2)
            ));
            if(this.direction.distance(new Velocity(0,0,0)) > 5) {
                this.direction.slow(0.5);
            }
        }
    }
    connect(rhizome) {
        if(this.multiplicity === 1 && rhizome.multiplicity === 1) {
            this.connections.push(rhizome);
            rhizome.connections.push(this);

            this.connectionLine = d.polyline(lines.is("2") || lines.is("3") ?
                [[this.position.x, this.position.y],
                [rhizome.position.x, rhizome.position.y]] : []).fill('none').stroke({width: 0.5});

                this.connections[0].oscillator.connect(this.feedback);
                this.feedback.connect(this.oscillator.frequency);

        } else if (this.multiplicity === 1 && rhizome.multiplicity > 1) {
            this.connections.push(rhizome.lastConnection);
            let lastConnection = rhizome.lastConnection;
            lastConnection.connections.forEach(connection => {
                if(this.position.x !== connection.position.x) {
                    this.connections.push(connection);
                    connection.connections.push(this);
                }
            }, this);
            lastConnection.connections.push(this);

            this.connections[0].oscillator.connect(this.feedback);
            this.feedback.connect(this.oscillator.frequency);

            this.connectionLine = d.polyline(lines.is("2") || lines.is("3") ?
                [[this.position.x, this.position.y],
                [rhizome.position.x, rhizome.position.y]] : []).fill('none').stroke({width: 0.5});
            if(rhizome.connectionLine.length === 0) {
                rhizome.connectionLine = d.polyline(lines.is("2") || lines.is("3") ?
                    [[rhizome.position.x, rhizome.position.y],
                    [this.position.x, this.position.y]] : []).fill('none').stroke({width: 0.5});
            } else if(rhizome.connections[0].connectionLine.length === 0) {
                rhizome.connections[0].connectionLine = d.polyline(lines.is("2") || lines.is("3") ?
                    [[rhizome.connections[0].position.x, rhizome.connections[0].position.y],
                    [this.position.x, this.position.y]] : []).fill('none').stroke({width: 0.5});
            }
        } 
    }
    move(position) {
        this.position = position;
        if(this.clock % 100 === 0) {
            this.setGain();
            this.setFeedback();
            this.connections.forEach(function(connection) {
                connection.setFeedback();
            });
        }
    }
    draw() {
        this.clock++;
        if(this.circle) {
            this.circle
                .x(origin.x + this.position.x/zoom - this.size)
                .y(origin.y + this.position.y/zoom - this.size);
            if(this.clock % 10 === 0 && tail.get() !== "0" && this.mass < 5) {
                this.drawPath();
            }
            if (lines.is("2") || lines.is("3")) {
                this.drawConnections();
            }
            
        } else {
            this.circle = d.circle(size * (massive.is("1") ? this.mass : 1))
            .fill('#000').move((origin.x + this.position.x/zoom - this.size), 
            (origin.y + this.position.y/zoom - this.size));
        }
    }
    setSize() {
        this.circle.radius(this.size);
        if(this.pathLine) {
            this.pathLine.stroke({ width: 1 * (massive.is("1") ? this.mass : 1)/2 });
        }
    }
    drawPath(){
        if( mousePosition !== null) {
            this.path = [];
        }
        this.path.push([origin.x + this.position.x/zoom, origin.y + this.position.y/zoom]);
        if(this.path.length>3 && !this.pathLine) {
            this.pathLine = d.polyline(this.path).fill('none').stroke({width: 1});
            this.setSize();
        } else if(this.path.length>1 && this.pathLine) {
            this.pathLine.plot(this.path);
        }
        if(this.path.length > tail.get()*100) {
            this.path.shift();
        }
    }
    drawConnections(){
        if(this.multiplicity > 1 && this.connectionLine.length !== 0) {
            let plot = [
                [origin.x + this.position.x/zoom,
                 origin.y + this.position.y/zoom]];
            this.connections.forEach(connection => {
                plot.push([origin.x + connection.position.x/zoom, 
                            origin.y + connection.position.y/zoom]);
            });
            this.connectionLine.plot(plot);
        }
    }
}

function draw() {
    rhizomes.forEach(rhizome => {
        rhizome.gravitate();
        rhizome.setPan();
        rhizome.draw();
    });
}

function setCenter() {
    let newCenter = new Position(0,0,0);
    rhizomes.forEach(function(rhizome) {

        newCenter.add(rhizome.position);
    });
    center = new Position(
        newCenter.x/rhizomes.length,
        newCenter.y/rhizomes.length,
        newCenter.z/rhizomes.length
    );
}

function createRhizomes() {
    if(positioning.is("0")) {
        for(let i = 0; i < number.get(); i++) {
            rhizomes.push(new Rhizome(
                new Position(
                    Math.round(Math.random()*window.innerWidth/1.5)+10+window.innerWidth/8,
                    Math.round(Math.random()*window.innerHeight/1.5)+10+window.innerHeight/8,0
                ),
                new Velocity(0,0,0),
                i === 0
            ));
        }
    } else {
        if(positioning.is("2")) {
            rhizomes.push(new Rhizome(
                new Position(
                    window.innerWidth/2,
                    window.innerHeight/2,
                    0
                ),
                new Velocity(0,0,0),
                6
            ));
        }
        for(let i = 0; i < number.get(); i++) {
            rhizomes.push(new Rhizome(
                new Position(
                    window.innerWidth/2+200*Math.sin(i *(2/number.get()*Math.PI)),
                    window.innerHeight/2+200*Math.cos(i *(2/number.get()*Math.PI)),
                    0
                ),
                positioning.is("2") ? new Velocity(Math.random()*2-1,Math.random()*2-1,0) : new Velocity(0,0,0),
                positioning.is("2") ? 0.1 : 0
            ));
        }
    }
}

function initializeSettings() {
    $('number').value = number.get();
    $('gravity').value = gravity.get();
    $('lopass').value = lopass.get();
    $('tune').value = tune.get();
    $('detune').value = detune.get();
    $('flutter').value = flutter.get();
    $('space').value = space.get();
    $('fm').value = fm.get();
    $('noise').value = noise.get();
    $('master').value = master.get();
    $('arp').value = arp.get();
    $('tail').value = tail.get();
    $('lines').value = lines.get();
    $('positioning').value = positioning.get();
    $('massive').value = massive.get();
    $('sub').value = sub.get();
    $('subFeedback').value = subFeedback.get();
    setVolume(master.get());
    setSelectedWave();
    setSelectedTuning();
    setDetune();
    setSpace();
    setConnecting();
}

function setSelectedWave() {
    rhizomes.forEach(rhizome => rhizome.setType());
    for (let key in waves) {
        $(key).classList.remove('selected');
    }
    $(wave.get()).classList.add('selected');
}

function setSelectedTuning() {
    for (let key in tunings) {
        $(key).classList.remove('selected');
    }
    $(tuning.get()).classList.add('selected');
}

function setVolume(volume) {
    masterGain.gain.value = volume/1000;
}

function setNoise() {
    noiseLevel.gain.setTargetAtTime(noise.get()/10000, ctx.currentTime + 0.5, 0.5);
}

function setSpace() {
    spaceGain.gain.setTargetAtTime(space.get()/2000, ctx.currentTime + 0.5, 0.5);
}

function setDetune() {
    rhizomes.forEach(rhizome => rhizome.setDetune());
}

function setFlutter() {
    rhizomes.forEach(rhizome => rhizome.setFlutter());
}

function setConnecting() {
    if(lines.is("1") || lines.is("2")) {
        connecting.set("1");
    }
    if(lines.is("0")) {
        connecting.set("0");
    }
    if(lines.is("0") || lines.is("1")) {
        rhizomes.forEach(rhizome => {
            if(rhizome.connectionLine.length !== 0) {
                rhizome.connectionLine.plot();
            }
        });
    }
}

function setArp() {
    if(arp.get() !== "0") {
        isArp = true;
    } else {
        isArp=false;
        isPaused=false;
        tArp=true;
        setVolume(master.get());
    }
}

function step() {
    if(isPaused || !tArp) {return;}
    setCenter();
    draw();
}

window.onload=function() {  
    d = SVG('screen').size(window.innerWidth, window.innerHeight);

    initializeSettings();
    createRhizomes();
    

    setArp();
    setNoise();
    setSpace();
    
    setInterval(() => step(), speed);

    // Eventhandlers
    $('screen').ondblclick = (e) => {
        let cX = event.clientX, cY = event.clientY;
        let newRhizome = new Rhizome(
            new Position(cX*zoom- 1*origin.x*zoom, cY*zoom- 1*origin.y*zoom,0),
            new Velocity(0,0,0),
            0
        ); 
        rhizomes.push(newRhizome);          
    };

    $('screen').onmousedown = e => {
        mousePosition = {
            x: e.screenX,
            y: e.screenY
        };
    };
    $('screen').onmouseup = e => {
        origin.x = origin.x + e.screenX - mousePosition.x;
        origin.y = origin.y + e.screenY - mousePosition.y;
        mousePosition = null;
    }; 
    $('screen').onmousemove = e => {
        if(mousePosition) {
            origin.x = origin.x + e.screenX - mousePosition.x;
            origin.y = origin.y + e.screenY - mousePosition.y;
            mousePosition.x = e.screenX;
            mousePosition.y = e.screenY;
        }
    };
 
    $('restart').onclick = () => {     
        location.reload();
    };

    $('show-hide-button').onclick = () => {
        show=!show;
        if(show) {
            $('settings').classList.remove('hide');
        } else {
            $('settings').classList.add('hide');
        } 
    };
 
    $('stop').onclick = () => {     
            if(!isPaused) {
                setVolume(0);
                isPaused = true;
            } else {
                setVolume(master.get());
                isPaused = false;
            }
    };
    
    setInterval(()=>{
        if(!isArp || arp.get() !== "1"){return;}
        tArp=!tArp;
        if(!tArp || isPaused) {
            setVolume(0);
        } else {
            setVolume(master.get());
        }
    },200);
    setInterval(()=>{
        if(!isArp || arp.get() !== "2"){return;}
        tArp=!tArp;
        if(!tArp || isPaused) {
            setVolume(0);
        } else {
            setVolume(master.get());
        }
    },100);
    setInterval(()=>{
        if(!isArp || arp.get() !== "3"){return;}
        tArp=!tArp;
        if(!tArp || isPaused) {
            setVolume(0);
        } else {
            setVolume(master.get());
        }
    },50);
    
    for(let key in waves) {
        $(key).onclick = e => {
            wave.set(e.target.id);
            setSelectedWave();
        };
    }

    for(let key in tunings) {
        $(key).onclick = e => {
            tuning.set(e.target.id);
            setSelectedTuning();
        };
    }

    $('lopass').oninput = () => {
        lopass.set($('lopass').value);
        rhizomes.forEach(rhizome => rhizome.setLopass());
    };
    $('sub').oninput = () => {
        sub.set($('sub').value);
        rhizomes.forEach(rhizome => rhizome.setSub());
    };
    $('subFeedback').oninput = () => {
        subFeedback.set($('subFeedback').value);
        rhizomes.forEach(rhizome => rhizome.setSubFeedback());
    };
    $('tune').oninput = () => tune.set($('tune').value);
    $('detune').oninput = () => {
        detune.set($('detune').value);
        setDetune();
    };
    $('flutter').oninput = () => {
        flutter.set($('flutter').value);
        setFlutter();
    };
    $('number').oninput = () => number.set($('number').value);
    $('gravity').oninput = () => gravity.set($('gravity').value);
    $('fm').oninput = () => fm.set($('fm').value);
    $('tail').oninput = () => tail.set($('tail').value);
    $('massive').oninput = () => {
        massive.set($('massive').value);
        rhizomes.forEach(rhizome => {
            rhizome.setSize();
        });
    };
    $('positioning').oninput = () => positioning.set($('positioning').value);
    $('lines').oninput = () => {
        lines.set($('lines').value);
        setConnecting();
    };
    $('noise').oninput = () => {
        noise.set($('noise').value);
        setNoise();
    };
    $('space').oninput = () => {
        space.set($('space').value);
        setSpace();
    };
    $('master').oninput = () => {
        master.set($('master').value); 
        isPaused = false;
        setVolume(master.get());
    };
    $('arp').oninput = () => {
        arp.set($('arp').value); 
        setArp();
    };

    window.addEventListener('wheel', function(e) {
        let afterX, afterY;
        let beforeX = center.x/zoom;
        let beforeY = center.y/zoom;
        if (e.deltaY < 0) {
            zoom-=0.2*zoom;
        } else if (e.deltaY > 0) {
            zoom+=0.2*zoom;
        }
        afterX = center.x/zoom;
        afterY = center.y/zoom;
        origin.x = origin.x - (afterX-beforeX);
        origin.y = origin.y - (afterY-beforeY);
        rhizomes.forEach(rhizome => {
            rhizome.setSize();
        });
    });
};