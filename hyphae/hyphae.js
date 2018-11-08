const EC = 10; //EXPANSION CONSTANT
let d,hyphae,terrain;
class Hypha {
    constructor(path) {
        this.path = path;
    }
    get position() {
        return this.path[this.path.length-1];
    }
    draw() {
        d.polyline(this.path).fill('none').stroke({ width: 1 });
    }
    expand() {
        let lweP = terrain.getLeastWorkExpansion(this.position, this.path);
        this.path.push(lweP);
    }
}

class Hyphae {
    constructor(hyphae) {
        this.hyphae = hyphae;
    }
    draw() {
        this.hyphae.forEach(hypha => {
            hypha.draw();
        });
    }
    expand() {
        this.hyphae.forEach(hypha => {
            hypha.expand();
        });
    }
}

class Terrain {
    constructor(size) {
        this.size = size;
        this.values = [];
        this.create();
    }
    create() {
        for(let i=0;i<this.size;i++) {
            let row = [];
            for(let j=0;j<this.size;j++) {
                row.push(j===0||j===this.size||i===0||i===this.size ? 2 : Math.random());
            }
            this.values.push(row);
        }
    }
    get(x,y) {
        return this.values[x][y];
    }
    getLeastWorkExpansion(pos, path) {
        let x = pos[0], y = pos[1];
        let possiblePositions = [
            [x+EC,y],[x+EC,y+EC],[x+EC,y-EC],
            [x-EC,y],[x-EC,y+EC],[x-EC,y-EC],
            [x,y+EC],[x,y-EC]
        ];

        possiblePositions = possiblePositions.filter(possiblePosition => 
            path.findIndex(i=>JSON.stringify(i)===JSON.stringify(possiblePosition))===-1 || possiblePosition[0]===0 || possiblePosition[1]===0
            );
        if(possiblePositions.length === 0) {
            console.log('hov');
        }
        let possiblePositionValues = possiblePositions.map(p=>this.get(p[0],p[1]));
        let minval = Math.min(...possiblePositionValues);
        let minpos = possiblePositions[possiblePositionValues.findIndex(i=>i===minval)];

        return minpos;
    }
}

window.onload=()=>{
    d = SVG('screen').size(window.innerWidth, window.innerHeight);
    terrain = new Terrain(window.innerWidth);
    hyphae = new Hyphae([new Hypha([[100,100],[200,200]])]);
    for(let i=0;i<100;i++) {
    hyphae.expand();
    }
    hyphae.draw();
    
}