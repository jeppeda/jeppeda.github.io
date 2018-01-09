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
        localStorage.setItem(this.name,setting)
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
        return new Position(this.x - body.x,this.y - body.y,this.z - body.z)
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

var ctx = new (window.AudioContext || window.webkitAudioContext)();

var limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = 0.0; // this is the pitfall, leave some headroom
    limiter.knee.value = 0.0; // brute force
    limiter.ratio.value = 20.0; // max compression
    limiter.attack.value = 0.001; // 5ms attack
    limiter.release.value = 0.050; // 50ms release
    limiter.connect(ctx.destination);

 var masterGain = ctx.createGain();
    masterGain.gain.value = 0.99;
    masterGain.connect(limiter); 

//CONSTANTS
let speed = 10;
var scale = 1;
var volume = 40;//8;
var feedback = 50;
let zoom = 1;
var size = 5;
let rhizomes = [];
let multiplicities = [];
let isPaused = false;
var center = new Position(300,300,0);
var origin = new Position(0,0,0);

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
}
let waves = {
    sin: 'sine',
    tri: 'sine',
    saw: 'sawtooth',
    sqr: 'square'
}

let wave = new Setting('wave', 'sin');
let tuning = new Setting('tuning', 'rnd');
let lopass = new Setting('lopass', '330');
let tune = new Setting('tune', '376');
let detune = new Setting('detune', '100');
let number = new Setting('number', '5');
let gravity = new Setting('gravity', '30');
let fm = new Setting('fm', '160');
let master = new Setting('master', '300');

//tunings
let frequencyMax = tune.get();
let pure = _pure(frequencyMax);
let pythagorean = _pythagorean(frequencyMax);
let quarterTone = _quarterTone(frequencyMax);
let regular = _regular(frequencyMax);
let minor = _minor(frequencyMax);
let tetrachord = _tetrachord(frequencyMax);
let hijaz = _hijaz(frequencyMax);
let jin = _jin(frequencyMax);
let phrygian = _phrygian(frequencyMax);
let penta = _penta(frequencyMax);

class Rhizome {
    constructor(position,direction, still) {
        this.identity = Math.random();
        this.position = position, 
        this.connections = [], this.lines = [];
        this.frequency = 0;
        this.energy = 1;
        this.clock = 0;
        this.direction = new Velocity(0,0,0);
        this.still = still;
        this.feedback = ctx.createGain();
        this.oscillator = ctx.createOscillator();
            this.oscillator.frequency.value = this.frequency; 
        this.subOscillator = ctx.createOscillator();
            this.subOscillator.frequency.value = this.frequency+this.identity*2-1; 
        this.setType(waves[wave.get()]);
        this.gain = ctx.createGain();
            this.gain.gain.value = 0;
        this.setGain();
        this.filter = ctx.createBiquadFilter();
            this.filter.type = "lowpass";
            this.filter.gain.setTargetAtTime(2, ctx.currentTime + 1, 0.5);
        this.pan = ctx.createStereoPanner();
        this.setPan();
        
        this.oscillator.connect(this.gain);
        this.subOscillator.connect(this.gain);
        this.gain.connect(this.filter);
        this.filter.connect(this.pan);
        this.pan.connect(masterGain);
        this.setFeedback();
        this.initFrequency();
        this.setLopass();
        this.oscillator.start();
        this.subOscillator.start();

        this.detune(0);
        this.setPan();

        this.draw();    
    }
    get multiplicity() {
        return this.connections.length + 1;
    }
    get lastConnection() {
        return this.connections[this.connections.length-1]
    }
    setType(type) {
        this.oscillator.type = type;
        this.subOscillator.type = type;
    }
    setFreq(freq) {
        this.frequency = freq;
        this.oscillator.frequency.value = freq;
        this.subOscillator.frequency.value = freq+this.identity*2-1;
    }
    setGain() {
        this.gain.gain.setTargetAtTime((volume/(rhizomes.length+1))/(this.position.distance(center)+20), ctx.currentTime + 1, 0.5);
    }
    setLopass() {
        //this.filter.frequency.value = 200 * this.identity + (this.frequency * (parseInt(lopass.get()) /1000))*6;
        this.filter.frequency.setValueAtTime(200 * this.identity + (this.frequency * (parseInt(lopass.get()) /1000))*6, ctx.currentTime);
    }
    setPan() {
        this.pan.pan.setValueAtTime( 
            (this.position.x - center.x)/200 < -1 ? -1 : 
            (this.position.x - center.x)/200 > 1 ? 1 : 
            (this.position.x - center.x)/200 ,ctx.currentTime
        );
    }
    detune(amount) {
        this.oscillator.detune.setValueAtTime(this.identity * 20 * amount, ctx.currentTime);
        this.subOscillator.detune.setValueAtTime(this.identity * 20 * amount, ctx.currentTime);
    }
    initFrequency() {
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
            Math.round(Math.random()*frequencyMax)
        );
    }
    setFeedback() {
        var i = 0;
        this.connections.forEach(function(connection) {
            if(this.position.distance(connection.position)*feedback < feedback) {
                this.feedback.gain.setTargetAtTime(this.position.distance(connection.position)*(fm.get()/50), ctx.currentTime + 1, 0.5);
            }
            connection.oscillator.connect(this.feedback)
            this.feedback.connect(this.oscillator.frequency);
            i++;
        }, this);
        this.filter.gain.setTargetAtTime(2+((this.energy)/200)*fm.get(), ctx.currentTime + 1, 0.5);
    }
    gravitate() {
        let self = this;
        if(this.connections.length > 0) {
            this.connections.forEach(function(connection) {
                self.attract(connection, true);
            });
            rhizomes.forEach(function(rhizome) {
                if(self.multiplicity != rhizome.multiplicity && !rhizome.dead) {
                    self.attract(rhizome, false);
                }   
            });
        } else if(rhizomes.length > 1) {
            rhizomes.forEach(function(rhizome) {
                if(self.position.x !== rhizome.position.x && !rhizome.dead) {
                    self.attract(rhizome, false);
                    if(self.position.distance(rhizome.position) < size*4) {
                        self.connect(rhizome);
                    }
                }
            });
        }
        if(this.direction.x !== 0) {
            if(!this.still){
                this.position.add(this.direction);
                this.move(this.position);
            }
        }
    }
    attract(attractor, connected) {     
        var distance = this.position.distance(attractor.position);
        if(distance > 4*size) {
            var distanceVector = this.position.distanceVector(attractor.position);
            this.direction.subtract(new Velocity(       
                distanceVector.x*(1/(connected ? gravity.get() / Math.PI : gravity.get()))/Math.pow(distance,2)*(1+(this.energy/100000)),
                distanceVector.y*(1/(connected ? gravity.get() / Math.PI : gravity.get()))/Math.pow(distance,2)*(1+this.energy/100000),
                distanceVector.z*(1/(connected ? gravity.get() / Math.PI : gravity.get()))/Math.pow(distance,2)*(1+this.energy/100000)
            ));
            if(this.direction.distance(new Velocity(0,0,0)) > 1) {
                this.direction.slow(0.4);
            }
        }
    }
    connect(rhizome) {
        if(this.multiplicity === 1 && rhizome.multiplicity === 1) {
            this.connections.push(rhizome);
            rhizome.connections.push(this);
        } else if (this.multiplicity === 1 && rhizome.multiplicity > 1) {
            this.connections.push(rhizome.lastConnection);
            var lastConnection = rhizome.lastConnection;
            lastConnection.connections.forEach(connection => {
                if(this.position.x !== connection.position.x) {
                    this.connections.push(connection);
                    connection.connections.push(this);
                }
            }, this);
            lastConnection.connections.push(this);
        } 
    }
    move(position) {
        if(!this.still) {this.position = position;}
        this.setGain();
        this.setFeedback();
        this.connections.forEach(function(connection) {
            connection.setFeedback();
        }); 
    }
    draw() {
        if (this.still){return;}
        this.clock++;
        if(this.circle) {
            this.circle.x(origin.x + this.position.x/zoom).y(origin.y + this.position.y/zoom);
            if(this.clock % 100 == 0) {
                this.circle.size(size+this.energy/1000);
            }
        } else {
            this.circle = d.circle(size).fill('#000').move(this.position.x/zoom, this.position.y/zoom);
        }
    }
    vibrate() {
        if(this.still){return;}
        let self = this;
        var E = 10;
        var amountSlow = 0.001;
        let y = 0, oldRhizome, newRhizomes = false;
        
        rhizomes.forEach(function(rhizome) {
        if(self.position.x !== rhizome.position.x && self.position.distance(rhizome.position) > 10) {
            if(rhizome.energy >= self.energy) {
                rhizome.energy += (E/self.position.distance(rhizome.position));
                self.energy -= (E/self.position.distance(rhizome.position))/self.multiplicity
            }
        } else if(self.position.x === rhizome.position.x && self.position.y === rhizome.position.y && self.energy > 3000 && !self.still) {
            self.still = true;
            newRhizomes = true;
            oldRhizome = y;
        }
        y++;
        });
        if(newRhizomes) {
            var firstRhizome, tempRhizome, num = 3;
            for(let i = 0; i < num; i++) {
                var newRhizome = new Rhizome(
                    new Position(
                        self.position.x+Math.sin((2*Math.PI/num)*i)*30,
                        self.position.y+Math.cos((2*Math.PI/num)*i)*30,0
                    ),
                    new Velocity(1,2,0),
                    i === 0
                );
                if(i==0){
                    firstRhizome = newRhizome;
                } else if(i>0) {
                    tempRhizome.connect(newRhizome);
                } else if(i===num-1) {
                    newRhizome.connect(firstRhizome)
                }
                tempRhizome = newRhizome;
                rhizomes.push(newRhizome);
            }

            self.dead = true;
            rhizomes.slice(oldRhizome, 1);
        }
    }
}

function draw() {
    rhizomes.forEach(function(rhizome) {
    if(!rhizome.dead)
            rhizome.draw();
    }, this);
}

function setCenter() {
    var newCenter = new Position(0,0,0);
    rhizomes.forEach(function(rhizome) {
        if(!rhizome.dead) {
            rhizome.gravitate();

            //rhizome.vibrate();
            newCenter.add(rhizome.position);
            rhizome.setPan();
        }
    }, this);
    center = new Position(
        newCenter.x/rhizomes.length,
        newCenter.y/rhizomes.length,
        newCenter.z/rhizomes.length
    );
}

function createRhizomes() {
    for(let i = 0; i < number.get(); i++) {
        rhizomes.push(new Rhizome(
            new Position(
                Math.round(Math.random()*window.innerWidth/1.5)+10+window.innerWidth/8,
                Math.round(Math.random()*window.innerHeight/1.5)+10+window.innerHeight/8,0
            ),
            new Velocity(1,2,0),
            i === 0
        ));
    }
}

function initializeSettings() {
    $('number').value = number.get();
    $('gravity').value = gravity.get();
    $('lopass').value = lopass.get();
    $('tune').value = tune.get();
    $('detune').value = detune.get();
    $('fm').value = fm.get();
    $('master').value = master.get();
    setVolume(master.get());
    setSelectedWave();
    setSelectedTuning();
    setDetune()
}

function setSelectedWave() {
    rhizomes.forEach(rhizome => rhizome.setType(waves[wave.get()]));
    for (var key in waves) {
        $(key).classList.remove('selected');
    }
    $(wave.get()).classList.add('selected');
}

function setSelectedTuning() {
    for (var key in tunings) {
        $(key).classList.remove('selected');
    }
    $(tuning.get()).classList.add('selected');
}

function setVolume(volume) {
    masterGain.gain.value = volume/1000;
}

function setDetune() {
    rhizomes.forEach(rhizome => rhizome.detune(detune.get()));
}

function step() {
    if(isPaused) {return;};
    setCenter();
    draw();
}

window.onload=function() {  
    d = SVG('screen').size(window.innerWidth, window.innerHeight);

    initializeSettings();
    createRhizomes();
    
    setInterval(() => step(), speed);

    // Eventhandlers
    $('screen').ondblclick = (e) => {
        var cX = event.clientX, cY = event.clientY;
        var newRhizome = new Rhizome(
            new Position((cX-size/2 - origin.x)*zoom,(cY-size/2 - origin.y)*zoom,0)
        ); 
        rhizomes.push(newRhizome);          
    };

    var tempPosition = null;
    $('screen').onmousedown = e => {
        tempPosition = {
            x: e.screenX,
            y: e.screenY
        }
    };
    $('screen').onmouseup = e => {
        origin.x = origin.x + e.screenX - tempPosition.x;
        origin.y = origin.y + e.screenY - tempPosition.y;
        tempPosition = null;
    };
    $('screen').onmousemove = e => {
        if(tempPosition) {
            origin.x = origin.x + e.screenX - tempPosition.x;
            origin.y = origin.y + e.screenY - tempPosition.y;
            tempPosition.x = e.screenX;
            tempPosition.y = e.screenY;
        }
    };
 
    $('restart').onclick = () => {     
        location.reload();
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

    for(key in waves) {
        $(key).onclick = e => {
            wave.set(e.target.id);
            setSelectedWave();
        };
    }

    for(key in tunings) {
        $(key).onclick = e => {
            tuning.set(e.target.id);
            setSelectedTuning();
        };
    }

    $('lopass').oninput = () => {
        lopass.set($('lopass').value);
        rhizomes.forEach(rhizome => rhizome.setLopass());
    };
    $('tune').oninput = () => tune.set($('tune').value);
    $('detune').oninput = () => {
        detune.set($('detune').value/1000);
        setDetune();
    };
    $('number').oninput = () => number.set($('number').value);
    $('gravity').oninput = () => gravity.set($('gravity').value);
    $('fm').oninput = () => fm.set($('fm').value);
    $('master').oninput = () => {
        master.set($('master').value); 
        isPaused = false;
        setVolume(master.get());
    }

    window.addEventListener('wheel', function(e) {
        if (e.deltaY < 0) {
            zoom+=e.deltaY/100;
        } else if (e.deltaY > 0) {
            zoom+=e.deltaY/100;
        }
    });
};
