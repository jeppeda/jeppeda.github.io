'use strict';
let $ = id => document.getElementById(id);

function randomElement(array) {
    let rnd = Math.floor(Math.random()*array.length);
    return array[rnd];
}

class Grammar {
    constructor(rules, start) {
        this.rules = rules;
        this.start = start;
    }
    expand() {
        const expandRules = (start, expansion) => {
            if(this.rules[start]) {
                let pick = randomElement(this.rules[start]);
                for(let i=0;i<pick.length;i++) {
                    expandRules(pick[i], expansion);
                }
            } else {
                expansion.push(start);
            }
            return expansion.join(" ");
        }
        return expandRules(this.start, []);
    }
}

window.onload = function() {  
    
    let grammar = new Grammar({
        "S": [["noun","adj","verb","adv"]]
    },
    "S");
    DICTIONARY.synsets.forEach(synset => {
        let type = synset["@base"].split(".")[1];
        let words = [];
        
        synset.synset.forEach(syn => {
            if(!syn.word['#text']) {
                syn.word.forEach(synword => {
                    words.push([synword['#text']]);
                });
            } else {
                words.push([syn.word['#text']]);
            }
        });
        grammar.rules[type] = words;
    });
    console.log('grammar.rules', grammar.rules);
    
    let source = "able communistic entity.take paradigm dismally communist";
    let sourceSentences = source.split(".");
    let sentenceGrammars = [];
    sourceSentences.forEach(sentence=>{
        if(sentence !== "") {
            let sentenceGrammar = [];
            let words = sentence.split(" ");
            words.forEach(word=>{
                let sentenceGrammarElement = "";
                for (var rule in grammar.rules) {
                    if(rule === "S") {continue;}
                    console.log('grammar.rules[rule]',grammar.rules[rule]);
                    grammar.rules[rule].forEach(element=> {
                        if(word === element[0]) {
                            sentenceGrammarElement = rule;
                        }
                    })
                }
                sentenceGrammar.push(sentenceGrammarElement);
            })
            console.log('sentenceGrammar', sentenceGrammar)
            sentenceGrammars.push(sentenceGrammar);
        }
    })
    grammar.rules.S = sentenceGrammars;
    
    $('text').innerHTML = grammar.expand();
}

const DICTIONARY = {
    "@version": "3.0",
    "synsets": [
       {
          "@source": "dict/data.adj",
          "@base": "data.adj.xml",
          "synset": [
             {
                "@id": "a00001740",
                "lex_filenum": "00",
                "word": {
                   "@lex_id": "0",
                   "#text": "able"
                },
                "pointer": [
                   {
                      "@refs": "n05200169 n05616246",
                      "#text": "Attribute"
                   },
                   {
                      "@refs": "n05616246 n05200169",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Derivationally related form"
                   },
                   {
                      "@refs": "a00002098",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Antonym"
                   }
                ],
                "def": "(usually followed by `to') having the necessary means or skill or know-how or authority to do something",
                "example": [
                   "able to swim",
                   "she was able to program her computer",
                   "we were at last able to buy a car",
                   "able to get a grant for the project"
                ]
             },
             {
                "@id": "a00327541",
                "lex_filenum": "00",
                "word": [
                   {
                      "@lex_id": "0",
                      "#text": "cancellate"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "cancellated"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "cancellous"
                   }
                ],
                "pointer": [
                   {
                      "@refs": "a00327031",
                      "#text": "Similar to"
                   },
                   {
                      "@refs": "n06057539",
                      "#text": "Domain of synset - TOPIC"
                   }
                ],
                "def": "having an open or latticed or porous structure"
             },
             {
                "@id": "a00653822",
                "lex_filenum": "00",
                "word": {
                   "@lex_id": "0",
                   "#text": "crowned"
                },
                "pointer": [
                   {
                      "@refs": "a00654829",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Antonym"
                   },
                   {
                      "@refs": "a00654125 a00654315 a00654394 a00654596 a00654685",
                      "#text": "Similar to"
                   }
                ],
                "def": [
                   "provided with or as if with a crown or a crown as specified",
                   "often used in combination"
                ],
                "example": [
                   "a high-crowned hat",
                   "an orange-crowned bird",
                   "a crowned signet ring"
                ]
             },
             {
                "@id": "a00995027",
                "lex_filenum": "00",
                "word": {
                   "@lex_id": "0",
                   "#text": "unsoundable"
                },
                "pointer": {
                   "@refs": "a00994882",
                   "#text": "Similar to"
                },
                "def": "too deep to determine the depth of"
             },
             {
                "@id": "a01331540",
                "lex_filenum": "00",
                "word": [
                   {
                      "@lex_id": "0",
                      "#text": "consolidative"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "unifying"
                   }
                ],
                "pointer": [
                   {
                      "@refs": "a01330986",
                      "#text": "Similar to"
                   },
                   {
                      "@refs": "v00242747 v00242580",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Derivationally related form"
                   }
                ],
                "def": "combining into a single unit"
             },
             {
                "@id": "a01656416",
                "lex_filenum": "00",
                "word": {
                   "@lex_id": "0",
                   "#text": "unspaced"
                },
                "pointer": [
                   {
                      "@refs": "a01655783",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Antonym"
                   },
                   {
                      "@refs": "a01656520",
                      "#text": "Similar to"
                   }
                ],
                "def": "arranged without spaces between"
             },
             {
                "@id": "a01988934",
                "lex_filenum": "00",
                "word": {
                   "@lex_id": "0",
                   "#text": "unbooked"
                },
                "pointer": {
                   "@refs": "a01988724",
                   "#text": "Similar to"
                },
                "def": "not reserved in advance"
             },
             {
                "@id": "a02295998",
                "lex_filenum": "00",
                "word": {
                   "@lex_id": "2",
                   "#text": "standard"
                },
                "pointer": [
                   {
                      "@refs": "a01593649",
                      "#text": "Also see"
                   },
                   {
                      "@refs": "n00033615",
                      "#text": "Attribute"
                   },
                   {
                      "@refs": "a02297166",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Antonym"
                   },
                   {
                      "@refs": "a02296415 a02296632 a02296824 a02296950 a02297089",
                      "#text": "Similar to"
                   }
                ],
                "def": [
                   "conforming to or constituting a standard of measurement or value",
                   "or of the usual or regularized or accepted kind"
                ],
                "example": [
                   "windows of standard width",
                   "standard sizes",
                   "the standard fixtures",
                   "standard brands",
                   "standard operating procedure"
                ]
             },
             {
                "@id": "a02610603",
                "lex_filenum": "01",
                "word": [
                   {
                      "@lex_id": "0",
                      "#text": "alchemic"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "alchemical"
                   }
                ],
                "pointer": [
                   {
                      "@refs": "n05778749",
                      "@source": "2",
                      "@target": "1",
                      "#text": "Derivationally related form"
                   },
                   {
                      "@refs": "n05778749",
                      "@source": "2",
                      "@target": "1",
                      "#text": "Pertainym (pertains to noun)"
                   },
                   {
                      "@refs": "n05778749",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Derivationally related form"
                   },
                   {
                      "@refs": "n05778749",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Pertainym (pertains to noun)"
                   }
                ],
                "def": "related to or concerned with alchemy"
             },
             {
                "@id": "a02874876",
                "lex_filenum": "01",
                "word": [
                   {
                      "@lex_id": "0",
                      "#text": "communist"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "communistic"
                   }
                ],
                "pointer": [
                   {
                      "@refs": "n08365855 n06214744",
                      "@source": "2",
                      "@target": "1",
                      "#text": "Derivationally related form"
                   },
                   {
                      "@refs": "n06214744",
                      "@source": "2",
                      "@target": "1",
                      "#text": "Pertainym (pertains to noun)"
                   },
                   {
                      "@refs": "n06214744",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Pertainym (pertains to noun)"
                   }
                ],
                "def": "relating to or marked by communism",
                "example": [
                   "Communist Party",
                   "communist governments",
                   "communistic propaganda"
                ]
             }
          ]
       },
       {
          "@source": "dict/data.adv",
          "@base": "data.adv.xml",
          "synset": [
             {
                "@id": "r00001740",
                "lex_filenum": "02",
                "word": {
                   "@lex_id": "0",
                   "#text": "a cappella"
                },
                "def": "without musical accompaniment",
                "example": "they performed a cappella"
             },
             {
                "@id": "r00063369",
                "lex_filenum": "02",
                "word": [
                   {
                      "@lex_id": "0",
                      "#text": "let alone"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "not to mention"
                   }
                ],
                "def": "much less",
                "example": "she can't boil potatoes, let alone cook a meal"
             },
             {
                "@id": "r00116510",
                "lex_filenum": "02",
                "word": {
                   "@lex_id": "0",
                   "#text": "together"
                },
                "def": "at the same time",
                "example": "we graduated together"
             },
             {
                "@id": "r00163236",
                "lex_filenum": "02",
                "word": {
                   "@lex_id": "0",
                   "#text": "gaily"
                },
                "pointer": {
                   "@refs": "a01367431",
                   "@source": "1",
                   "@target": "1",
                   "#text": "Derived from adjective"
                },
                "def": "in a gay manner",
                "example": "the scandals were gaily diverting"
             },
             {
                "@id": "r00212411",
                "lex_filenum": "02",
                "word": [
                   {
                      "@lex_id": "1",
                      "#text": "incidentally"
                   },
                   {
                      "@lex_id": "3",
                      "#text": "accidentally"
                   }
                ],
                "pointer": {
                   "@refs": "a01856929",
                   "@source": "1",
                   "@target": "1",
                   "#text": "Derived from adjective"
                },
                "def": "of a minor or subordinate nature",
                "example": "these magnificent achievements were only incidentally influenced by Oriental models"
             },
             {
                "@id": "r00261389",
                "lex_filenum": "02",
                "word": [
                   {
                      "@lex_id": "0",
                      "#text": "agonizingly"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "excruciatingly"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "torturously"
                   }
                ],
                "pointer": [
                   {
                      "@refs": "a01711724",
                      "@source": "3",
                      "@target": "6",
                      "#text": "Derived from adjective"
                   },
                   {
                      "@refs": "a01711724",
                      "@source": "2",
                      "@target": "3",
                      "#text": "Derived from adjective"
                   },
                   {
                      "@refs": "a01711724",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Derived from adjective"
                   }
                ],
                "def": "in a very painful manner",
                "example": "the progress was agonizingly slow"
             },
             {
                "@id": "r00316486",
                "lex_filenum": "02",
                "word": [
                   {
                      "@lex_id": "0",
                      "#text": "dismally"
                   },
                   {
                      "@lex_id": "1",
                      "#text": "dreadfully"
                   }
                ],
                "pointer": {
                   "@refs": "a01126291",
                   "@source": "2",
                   "@target": "4",
                   "#text": "Derived from adjective"
                },
                "def": "in a dreadful manner",
                "example": "as he looks at the mess he has left behind he must wonder how the Brits so often managed to succeed in the kind of situation where he has so dismally failed"
             },
             {
                "@id": "r00370920",
                "lex_filenum": "02",
                "word": {
                   "@lex_id": "0",
                   "#text": "conspicuously"
                },
                "pointer": [
                   {
                      "@refs": "r00371171",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Antonym"
                   },
                   {
                      "@refs": "a02090567",
                      "@source": "1",
                      "@target": "3",
                      "#text": "Derived from adjective"
                   }
                ],
                "def": "in a manner tending to attract attention",
                "example": "there have been plenty of general declarations about willingness to meet and talk, but conspicuously no mention of time and place"
             },
             {
                "@id": "r00423888",
                "lex_filenum": "02",
                "word": {
                   "@lex_id": "0",
                   "#text": "rallentando"
                },
                "pointer": {
                   "@refs": "n07020895",
                   "#text": "Domain of synset - TOPIC"
                },
                "def": "slowing down",
                "example": "this passage should be played rallentando"
             },
             {
                "@id": "r00471945",
                "lex_filenum": "02",
                "word": {
                   "@lex_id": "0",
                   "#text": "surpassingly"
                },
                "pointer": {
                   "@refs": "a01676026",
                   "@source": "1",
                   "@target": "5",
                   "#text": "Derived from adjective"
                },
                "def": "to a surpassing degree",
                "example": "she was a surpassingly beautiful woman"
             }
          ]
       },
       {
          "@source": "dict/data.noun",
          "@base": "data.noun.xml",
          "synset": [
             {
                "@id": "n00001740",
                "lex_filenum": "03",
                "word": {
                   "@lex_id": "0",
                   "#text": "entity"
                },
                "pointer": {
                   "@refs": "n00001930 n00002137 n04424418",
                   "#text": "Hyponym"
                },
                "def": "that which is perceived or known or inferred to have its own distinct existence (living or nonliving)"
             },
             {
                "@id": "n01608265",
                "lex_filenum": "05",
                "word": [
                   {
                      "@lex_id": "0",
                      "#text": "honey buzzard"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "Pernis apivorus"
                   }
                ],
                "pointer": [
                   {
                      "@refs": "n01605630",
                      "#text": "Hypernym"
                   },
                   {
                      "@refs": "n01608086",
                      "#text": "Member holonym"
                   }
                ],
                "def": "Old World hawk that feeds on bee larvae and small rodents and reptiles"
             },
             {
                "@id": "n03037590",
                "lex_filenum": "06",
                "word": {
                   "@lex_id": "0",
                   "#text": "clarence"
                },
                "pointer": {
                   "@refs": "n02968473",
                   "#text": "Hypernym"
                },
                "def": "a closed carriage with four wheels and seats for four passengers"
             },
             {
                "@id": "n04421740",
                "lex_filenum": "06",
                "word": {
                   "@lex_id": "0",
                   "#text": "thermojunction"
                },
                "pointer": {
                   "@refs": "n03605915",
                   "#text": "Hypernym"
                },
                "def": "a junction between two dissimilar metals across which a voltage appears"
             },
             {
                "@id": "n06013298",
                "lex_filenum": "09",
                "word": {
                   "@lex_id": "0",
                   "#text": "vector algebra"
                },
                "pointer": [
                   {
                      "@refs": "n06012726",
                      "#text": "Hypernym"
                   },
                   {
                      "@refs": "n06000644",
                      "#text": "Domain of synset - TOPIC"
                   },
                   {
                      "@refs": "n06013471",
                      "#text": "Hyponym"
                   }
                ],
                "def": "the part of algebra that deals with the theory of vectors and vector spaces"
             },
             {
                "@id": "n07581132",
                "lex_filenum": "13",
                "word": {
                   "@lex_id": "0",
                   "#text": "confit"
                },
                "pointer": {
                   "@refs": "n07653394",
                   "#text": "Hypernym"
                },
                "def": "a piece of meat (especially a duck) cooked slowly in its own fat"
             },
             {
                "@id": "n09168592",
                "lex_filenum": "15",
                "word": {
                   "@lex_id": "0",
                   "#text": "Black Rock Desert"
                },
                "pointer": [
                   {
                      "@refs": "n08505573",
                      "#text": "Instance Hypernym"
                   },
                   {
                      "@refs": "n09110422",
                      "#text": "Part holonym"
                   }
                ],
                "def": "a desert in northwestern Nevada"
             },
             {
                "@id": "n10604089",
                "lex_filenum": "18",
                "word": [
                   {
                      "@lex_id": "0",
                      "#text": "sitting duck"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "easy mark"
                   }
                ],
                "pointer": {
                   "@refs": "n10752480",
                   "#text": "Hypernym"
                },
                "def": "a defenseless victim"
             },
             {
                "@id": "n12200143",
                "lex_filenum": "20",
                "word": [
                   {
                      "@lex_id": "0",
                      "#text": "looking-glass plant"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "Heritiera littoralis"
                   }
                ],
                "pointer": {
                   "@refs": "n13109733",
                   "#text": "Hypernym"
                },
                "def": "small tree of coastal regions of Old World tropics whose leaves are silvery beneath"
             },
             {
                "@id": "n13804375",
                "lex_filenum": "24",
                "word": {
                   "@lex_id": "0",
                   "#text": "paradigm"
                },
                "pointer": [
                   {
                      "@refs": "n13803782",
                      "#text": "Hypernym"
                   },
                   {
                      "@refs": "a02965552",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Derivationally related form"
                   }
                ],
                "def": "systematic arrangement of all the inflected forms of a word"
             }
          ]
       },
       {
          "@source": "dict/data.verb",
          "@base": "data.verb.xml",
          "synset": [
             {
                "@id": "v00001740",
                "lex_filenum": "29",
                "word": [
                   {
                      "@lex_id": "0",
                      "#text": "breathe"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "take a breath"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "respire"
                   },
                   {
                      "@lex_id": "3",
                      "#text": "suspire"
                   }
                ],
                "pointer": [
                   {
                      "@refs": "v00005041 v00004227",
                      "#text": "Entailment"
                   },
                   {
                      "@refs": "a03110322 n04080833",
                      "@source": "3",
                      "@target": "1",
                      "#text": "Derivationally related form"
                   },
                   {
                      "@refs": "n00831191",
                      "@source": "3",
                      "@target": "3",
                      "#text": "Derivationally related form"
                   },
                   {
                      "@refs": "n04250850",
                      "@source": "1",
                      "@target": "5",
                      "#text": "Derivationally related form"
                   },
                   {
                      "@refs": "n00831191",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Derivationally related form"
                   },
                   {
                      "@refs": "v00004227 v00005041",
                      "@source": "1",
                      "@target": "3",
                      "#text": "Also see"
                   },
                   {
                      "@refs": "v00002325 v00002573",
                      "#text": "Verb Group"
                   },
                   {
                      "@refs": "v00002573 v00002724 v00002942 v00003826 v00004032 v00004227 v00005041 v00006697 v00007328 v00017031",
                      "#text": "Hyponym"
                   }
                ],
                "frame": [
                   {
                      "@f_num": "2"
                   },
                   {
                      "@f_num": "8"
                   }
                ],
                "def": "draw air into, and expel out of, the lungs",
                "example": [
                   "I can breathe better when the air is clean",
                   "The patient is respiring"
                ]
             },
             {
                "@id": "v00286798",
                "lex_filenum": "30",
                "word": {
                   "@lex_id": "0",
                   "#text": "smut"
                },
                "pointer": [
                   {
                      "@refs": "v00286605",
                      "#text": "Hypernym"
                   },
                   {
                      "@refs": "n14793533",
                      "@source": "1",
                      "@target": "4",
                      "#text": "Derivationally related form"
                   }
                ],
                "frame": [
                   {
                      "@f_num": "8"
                   },
                   {
                      "@f_num": "11"
                   }
                ],
                "def": "stain with a dirty substance, such as soot"
             },
             {
                "@id": "v00557404",
                "lex_filenum": "30",
                "word": {
                   "@lex_id": "9",
                   "#text": "take"
                },
                "pointer": {
                   "@refs": "v00149583",
                   "#text": "Hypernym"
                },
                "frame": {
                   "@f_num": "7"
                },
                "def": "be seized or affected in a specified way",
                "example": [
                   "take sick",
                   "be taken drunk"
                ]
             },
             {
                "@id": "v00855794",
                "lex_filenum": "32",
                "word": [
                   {
                      "@lex_id": "0",
                      "#text": "referee"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "peer review"
                   }
                ],
                "pointer": [
                   {
                      "@refs": "v00855512",
                      "#text": "Hypernym"
                   },
                   {
                      "@refs": "n10526927",
                      "@source": "1",
                      "@target": "2",
                      "#text": "Derivationally related form"
                   }
                ],
                "frame": {
                   "@f_num": "8"
                },
                "def": "evaluate professionally a colleague's work"
             },
             {
                "@id": "v01135783",
                "lex_filenum": "33",
                "word": [
                   {
                      "@lex_id": "0",
                      "#text": "open fire"
                   },
                   {
                      "@lex_id": "1",
                      "#text": "fire"
                   }
                ],
                "pointer": [
                   {
                      "@refs": "v01134781",
                      "#text": "Hypernym"
                   },
                   {
                      "@refs": "n00986938",
                      "@source": "2",
                      "@target": "1",
                      "#text": "Derivationally related form"
                   },
                   {
                      "@refs": "n00986938",
                      "@source": "2",
                      "@target": "2",
                      "#text": "Derivationally related form"
                   }
                ],
                "frame": [
                   {
                      "@f_num": "2"
                   },
                   {
                      "@f_num": "22"
                   }
                ],
                "def": "start firing a weapon"
             },
             {
                "@id": "v01389329",
                "lex_filenum": "35",
                "word": [
                   {
                      "@lex_id": "1",
                      "#text": "compress"
                   },
                   {
                      "@lex_id": "3",
                      "#text": "compact"
                   },
                   {
                      "@lex_id": "0",
                      "#text": "pack together"
                   }
                ],
                "pointer": [
                   {
                      "@refs": "v01447257",
                      "#text": "Entailment"
                   },
                   {
                      "@refs": "v01527271",
                      "#text": "Hypernym"
                   },
                   {
                      "@refs": "n00358089",
                      "@source": "2",
                      "@target": "3",
                      "#text": "Derivationally related form"
                   },
                   {
                      "@refs": "v01389607",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Antonym"
                   },
                   {
                      "@refs": "n00616083",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Derivationally related form"
                   },
                   {
                      "@refs": "n00356790",
                      "@source": "1",
                      "@target": "2",
                      "#text": "Derivationally related form"
                   },
                   {
                      "@refs": "v01574571",
                      "#text": "Hyponym"
                   }
                ],
                "frame": [
                   {
                      "@f_num": "8"
                   },
                   {
                      "@f_num": "11"
                   },
                   {
                      "@f_num": "21"
                   }
                ],
                "def": "make more compact by or as if by pressing",
                "example": "compress the data"
             },
             {
                "@id": "v01660976",
                "lex_filenum": "36",
                "word": {
                   "@lex_id": "0",
                   "#text": "dip"
                },
                "pointer": [
                   {
                      "@refs": "v01653013",
                      "#text": "Hypernym"
                   },
                   {
                      "@refs": "n03203089",
                      "@source": "1",
                      "@target": "1",
                      "#text": "Derivationally related form"
                   }
                ],
                "frame": {
                   "@f_num": "8"
                },
                "def": "place (candle wicks) into hot, liquid wax"
             },
             {
                "@id": "v01938942",
                "lex_filenum": "38",
                "word": {
                   "@lex_id": "0",
                   "#text": "schuss"
                },
                "pointer": [
                   {
                      "@refs": "v01938426",
                      "#text": "Hypernym"
                   },
                   {
                      "@refs": "n00523513",
                      "#text": "Domain of synset - TOPIC"
                   }
                ],
                "frame": {
                   "@f_num": "2"
                },
                "def": "ski downhill"
             },
             {
                "@id": "v02208265",
                "lex_filenum": "40",
                "word": {
                   "@lex_id": "13",
                   "#text": "get"
                },
                "pointer": [
                   {
                      "@refs": "v02207206",
                      "#text": "Hypernym"
                   },
                   {
                      "@refs": "n01090446",
                      "#text": "Domain of synset - TOPIC"
                   },
                   {
                      "@refs": "n00041899",
                      "@source": "1",
                      "@target": "2",
                      "#text": "Derivationally related form"
                   }
                ],
                "frame": {
                   "@f_num": "8"
                },
                "def": "purchase",
                "example": "What did you get at the toy store?"
             },
             {
                "@id": "v02489363",
                "lex_filenum": "41",
                "word": {
                   "@lex_id": "0",
                   "#text": "mismarry"
                },
                "pointer": {
                   "@refs": "v02488834",
                   "#text": "Hypernym"
                },
                "frame": {
                   "@f_num": "2"
                },
                "def": "marry an unsuitable partner"
             }
          ]
       }
    ]
 };