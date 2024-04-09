import { AnyGerberCommand } from "../any_gerber_command"
import { gerberBuilder } from "../gerber-builder"

export const defineCommonMacros = (glayer: Array<AnyGerberCommand>) => {
  glayer.push(
    ...gerberBuilder()
      .add("comment", { comment: "APERTURE MACROS START" })
      .add("define_macro_aperture_template", {
        macro_name: "RoundRect",
        template_code: `
0 Rectangle with rounded corners*
0 $1 Corner radius*
0 $2 $3 $4 $5 $6 $7 $8 $9 X,Y Position of each corner*
0 Polygon box body*
4,1,4,$2,$3,$4,$5,$6,$7,$8,$9,$2,$3,0*
0 Circles for rounded corners*
1,1,$1+$1,$2,$3*
1,1,$1+$1,$4,$5*
1,1,$1+$1,$6,$7*
1,1,$1+$1,$8,$9*
0 Rectangles between the rounded corners*
20,1,$1+$1,$2,$3,$4,$5,0*
20,1,$1+$1,$4,$5,$6,$7,0*
20,1,$1+$1,$6,$7,$8,$9,0*
20,1,$1+$1,$8,$9,$2,$3,0*%
`.trim(),
      })
      .add("comment", { comment: "APERTURE MACROS END" })
      .build()
  )
}
