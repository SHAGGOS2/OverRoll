import type { PortraitFrame } from './portraitFrames'

// Original transparent class renders; frames remove empty source-image margins.
export const tf2Artwork: Record<string, { portrait: string; frame: PortraitFrame }> = {
  "tf2-scout": {
    "portrait": "assets/tf2/renders/scout.png",
    "frame": {
      "x": 195,
      "y": 0,
      "width": 374,
      "height": 764,
      "sourceWidth": 764,
      "sourceHeight": 764
    }
  },
  "tf2-soldier": {
    "portrait": "assets/tf2/renders/soldier.png",
    "frame": {
      "x": 161,
      "y": 0,
      "width": 444,
      "height": 766,
      "sourceWidth": 766,
      "sourceHeight": 766
    }
  },
  "tf2-pyro": {
    "portrait": "assets/tf2/renders/pyro.png",
    "frame": {
      "x": 170,
      "y": 0,
      "width": 424,
      "height": 764,
      "sourceWidth": 764,
      "sourceHeight": 764
    }
  },
  "tf2-demoman": {
    "portrait": "assets/tf2/renders/demoman.png",
    "frame": {
      "x": 209,
      "y": 0,
      "width": 345,
      "height": 764,
      "sourceWidth": 764,
      "sourceHeight": 764
    }
  },
  "tf2-heavy": {
    "portrait": "assets/tf2/renders/heavy.png",
    "frame": {
      "x": 125,
      "y": 0,
      "width": 514,
      "height": 764,
      "sourceWidth": 764,
      "sourceHeight": 764
    }
  },
  "tf2-engineer": {
    "portrait": "assets/tf2/renders/engineer.png",
    "frame": {
      "x": 219,
      "y": 0,
      "width": 325,
      "height": 764,
      "sourceWidth": 764,
      "sourceHeight": 764
    }
  },
  "tf2-medic": {
    "portrait": "assets/tf2/renders/medic.png",
    "frame": {
      "x": 186,
      "y": 0,
      "width": 392,
      "height": 765,
      "sourceWidth": 765,
      "sourceHeight": 765
    }
  },
  "tf2-sniper": {
    "portrait": "assets/tf2/renders/sniper.png",
    "frame": {
      "x": 192,
      "y": 0,
      "width": 380,
      "height": 764,
      "sourceWidth": 764,
      "sourceHeight": 764
    }
  },
  "tf2-spy": {
    "portrait": "assets/tf2/renders/spy.png",
    "frame": {
      "x": 230,
      "y": 0,
      "width": 304,
      "height": 765,
      "sourceWidth": 765,
      "sourceHeight": 765
    }
  }
}
