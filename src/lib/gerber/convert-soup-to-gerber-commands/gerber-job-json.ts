/**
 * job.gbrjob file format
 *
 * {
 *   "Header": {
 *     "GenerationSoftware": {
 *       "Vendor": "KiCad",
 *       "Application": "Pcbnew",
 *       "Version": "8.0.1"
 *     },
 *     "CreationDate": "2024-04-08T11:14:22-07:00"
 *   },
 *   "GeneralSpecs": {
 *     "ProjectId": {
 *       "Name": "",
 *       "GUID": "58585858-5858-4585-9858-585858585858",
 *       "Revision": "rev?"
 *     },
 *     "Size": {
 *       "X": 0.0,
 *       "Y": 0.0
 *     },
 *     "LayerNumber": 2,
 *     "BoardThickness": 1.6,
 *     "Finish": "None"
 *   },
 *   "DesignRules": [
 *     {
 *       "Layers": "Outer",
 *       "PadToPad": 0.2,
 *       "PadToTrack": 0.2,
 *       "TrackToTrack": 0.2
 *     }
 *   ],
 *   "FilesAttributes": [
 *     {
 *       "Path": "-F_Cu.gbr",
 *       "FileFunction": "Copper,L1,Top",
 *       "FilePolarity": "Positive"
 *     },
 *     {
 *       "Path": "-B_Cu.gbr",
 *       "FileFunction": "Copper,L2,Bot",
 *       "FilePolarity": "Positive"
 *     },
 *     {
 *       "Path": "-F_Paste.gbr",
 *       "FileFunction": "SolderPaste,Top",
 *       "FilePolarity": "Positive"
 *     },
 *     {
 *       "Path": "-B_Paste.gbr",
 *       "FileFunction": "SolderPaste,Bot",
 *       "FilePolarity": "Positive"
 *     },
 *     {
 *       "Path": "-F_Silkscreen.gbr",
 *       "FileFunction": "Legend,Top",
 *       "FilePolarity": "Positive"
 *     },
 *     {
 *       "Path": "-B_Silkscreen.gbr",
 *       "FileFunction": "Legend,Bot",
 *       "FilePolarity": "Positive"
 *     },
 *     {
 *       "Path": "-F_Mask.gbr",
 *       "FileFunction": "SolderMask,Top",
 *       "FilePolarity": "Negative"
 *     },
 *     {
 *       "Path": "-B_Mask.gbr",
 *       "FileFunction": "SolderMask,Bot",
 *       "FilePolarity": "Negative"
 *     },
 *     {
 *       "Path": "-Edge_Cuts.gbr",
 *       "FileFunction": "Profile",
 *       "FilePolarity": "Positive"
 *     }
 *   ],
 *   "MaterialStackup": [
 *     {
 *       "Type": "Legend",
 *       "Name": "Top Silk Screen"
 *     },
 *     {
 *       "Type": "SolderPaste",
 *       "Name": "Top Solder Paste"
 *     },
 *     {
 *       "Type": "SolderMask",
 *       "Name": "Top Solder Mask"
 *     },
 *     {
 *       "Type": "Copper",
 *       "Name": "F.Cu"
 *     },
 *     {
 *       "Type": "Dielectric",
 *       "Material": "FR4",
 *       "Name": "F.Cu/B.Cu",
 *       "Notes": "Type: dielectric layer 1 (from F.Cu to B.Cu)"
 *     },
 *     {
 *       "Type": "Copper",
 *       "Name": "B.Cu"
 *     },
 *     {
 *       "Type": "SolderMask",
 *       "Name": "Bottom Solder Mask"
 *     },
 *     {
 *       "Type": "SolderPaste",
 *       "Name": "Bottom Solder Paste"
 *     },
 *     {
 *       "Type": "Legend",
 *       "Name": "Bottom Silk Screen"
 *     }
 *   ]
 * }
 */
export interface GerberJobJson {
  Header: {
    GenerationSoftware: {
      Vendor: string
      Application: string
      Version: string
    }
    CreationDate: string
  }
  GeneralSpecs: {
    ProjectId: {
      Name: string
      GUID: string
      Revision: string
    }
    Size: {
      X: number
      Y: number
    }
    LayerNumber: number
    BoardThickness: number
    Finish: string
  }
  DesignRules: {
    Layers: string
    PadToPad: number
    PadToTrack: number
    TrackToTrack: number
  }[]
  FilesAttributes: {
    Path: string
    FileFunction: string
    FilePolarity: string
  }[]
  MaterialStackup: {
    Type: string
    Name: string
    Material?: string
    Notes?: string
  }[]
}
