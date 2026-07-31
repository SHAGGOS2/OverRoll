.pragma library

var pvzRaw = [
    "plant-1-citron",
    "plant-2-frozen-citron",
    "plant-3-electro-citron",
    "plant-4-iron-citron",
    "plant-5-party-citron",
    "plant-6-toxic-citron",
    "plant-7-rose",
    "plant-8-druid-rose",
    "plant-9-fire-rose",
    "plant-10-frost-rose",
    "plant-11-party-rose",
    "plant-12-nec-rose",
    "plant-13-kernel-corn",
    "plant-14-bbq-corn",
    "plant-15-mob-cob",
    "plant-16-pops-corn",
    "plant-17-party-corn",
    "plant-18-commando-corn",
    "plant-19-peashooter",
    "plant-20-fire-pea",
    "plant-21-ice-pea",
    "plant-22-toxic-pea",
    "plant-23-commando-pea",
    "plant-24-agent-pea",
    "plant-25-law-pea",
    "plant-26-plasma-pea",
    "plant-27-rock-pea",
    "plant-28-electro-pea",
    "plant-29-chomper",
    "plant-30-fire-chomper",
    "plant-31-hot-rod-chomper",
    "plant-32-power-chomper",
    "plant-33-count-chompula",
    "plant-34-toxic-chomper",
    "plant-35-armor-chomper",
    "plant-36-chomp-thing",
    "plant-37-yeti-chomper",
    "plant-38-disco-chomper",
    "plant-39-unicorn-chomper",
    "plant-40-twilight-chomper",
    "plant-41-sunflower",
    "plant-42-fire-flower",
    "plant-43-power-flower",
    "plant-44-shadow-flower",
    "plant-45-mystic-flower",
    "plant-46-metal-petal",
    "plant-47-sun-pharaoh",
    "plant-48-alien-flower",
    "plant-49-vampire-flower",
    "plant-50-stuffy-flower",
    "plant-51-cactus",
    "plant-52-fire-cactus",
    "plant-53-ice-cactus",
    "plant-54-power-cactus",
    "plant-55-future-cactus",
    "plant-56-camo-cactus",
    "plant-57-bandit-cactus",
    "plant-58-jade-cactus",
    "plant-59-zen-cactus",
    "plant-60-petrified-cactus",
    "plant-61-torchwood",
    "zombie-1-imp",
    "zombie-2-lil--drake",
    "zombie-3-pylon-imp",
    "zombie-4-shrimp",
    "zombie-5-z7-imp",
    "zombie-6-party-imp",
    "zombie-7-scallywag-imp",
    "zombie-8-super-brainz",
    "zombie-9-cozmic-brainz",
    "zombie-10-electro-brainz",
    "zombie-11-toxic-brainz",
    "zombie-12-party-brainz",
    "zombie-13-breakfast-brainz",
    "zombie-14-captain-deadbeard",
    "zombie-15-captain-cannon",
    "zombie-16-captain-flameface",
    "zombie-17-captain-sharkbite",
    "zombie-18-captain-partyman",
    "zombie-19-captain-squawk",
    "zombie-20-foot-soldier",
    "zombie-21-super-commando",
    "zombie-22-arctic-trooper",
    "zombie-23-tank-commander",
    "zombie-24-general-surpremo",
    "zombie-25-camo-ranger",
    "zombie-26-sky-trooper",
    "zombie-27-centurion",
    "zombie-28-park-ranger",
    "zombie-29-scuba-soldier",
    "zombie-30-engineer",
    "zombie-31-welder",
    "zombie-33-electrician",
    "zombie-33-mechanic",
    "zombie-34-painter",
    "zombie-35-plumber",
    "zombie-36-landscaper",
    "zombie-37-sanitation-expert",
    "zombie-38-roadie-z",
    "zombie-39-ac-perry",
    "zombie-40-scientist",
    "zombie-41-marine-biologist",
    "zombie-42-dr-toxic",
    "zombie-43-physicist",
    "zombie-44-astronaut",
    "zombie-45-chemist",
    "zombie-46-archaeologist",
    "zombie-47-paleontologist",
    "zombie-48-zoologist",
    "zombie-49-computer-scientist",
    "zombie-50-all-star",
    "zombie-51-cricket-star",
    "zombie-52-goalie-star",
    "zombie-53-baseball-star",
    "zombie-54-hockey-star",
    "zombie-55-rugby-star",
    "zombie-56-wrestling-star",
    "zombie-57-golf-star",
    "zombie-58-moto-x-star",
    "zombie-59-tennis-star",
    "zombie-60-hover-goat-3000"
]

var nameOverrides = {
    "plant-12-nec-rose": "Nec'Rose",
    "plant-14-bbq-corn": "BBQ Corn",
    "zombie-2-lil--drake": "Lil' Drake",
    "zombie-5-z7-imp": "Z7 Imp",
    "zombie-24-general-surpremo": "General Supremo",
    "zombie-39-ac-perry": "AC Perry",
    "zombie-42-dr-toxic": "Dr. Toxic",
    "zombie-60-hover-goat-3000": "Hover Goat-3000"
}

function titleCaseSlug(raw) {
    if (nameOverrides[raw]) return nameOverrides[raw]
    var parts = raw.split("-").slice(2)
    var words = []
    for (var i = 0; i < parts.length; ++i) {
        if (!parts[i]) continue
        words.push(parts[i].charAt(0).toUpperCase() + parts[i].slice(1))
    }
    return words.join(" ")
}

function buildRows() {
    var rows = []
    for (var i = 0; i < pvzRaw.length; ++i) {
        var raw = pvzRaw[i]
        var plant = raw.indexOf("plant-") === 0
        rows.push({
            key: raw,
            name: titleCaseSlug(raw),
            side: plant ? "plants" : "zombies",
            portrait: "../data/assets/other_hs/pvzgw2/" + raw + ".png"
        })
    }
    return rows
}


var rows = buildRows()
