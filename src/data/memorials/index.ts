import type { MemorialTemplate } from '../../engine/types'
import { SCRIPT_TEMPLATES } from './script'
import { FINANCE_TEMPLATES } from './finance'
import { PERSONNEL_TEMPLATES } from './personnel'
import { MILITARY_TEMPLATES } from './military'
import { FOREIGN_TEMPLATES } from './foreign'
import { DISASTER_TEMPLATES } from './disaster'
import { MISC_TEMPLATES } from './misc'
import * as ST from './statute-triggers'
import { YEAR_1583 } from './year-1583'
import { YEAR_1584_85 } from './year-1584-85'
import { YEAR_1586_87 } from './year-1586-87'
import { LINE_JZ_QZ } from './line-jz-qz'
import { LINE_ENDINGS } from './line-endings'
import { purgeBacklash } from './line-faction'

const ALL = [
  ...SCRIPT_TEMPLATES,
  ...FINANCE_TEMPLATES,
  ...PERSONNEL_TEMPLATES,
  ...MILITARY_TEMPLATES,
  ...FOREIGN_TEMPLATES,
  ...DISASTER_TEMPLATES,
  ...MISC_TEMPLATES,
  ST.kcAbolishedPay,
  ST.ytbJiangnan,
  ST.khPirate,
  ST.khEunuchTax,
  ST.zlPrince,
  ST.ksRiot,
  ST.tzSilence,
  ...YEAR_1583,
  ...YEAR_1584_85,
  ...YEAR_1586_87,
  ...LINE_JZ_QZ,
  ...LINE_ENDINGS,
  purgeBacklash,
]

export const TEMPLATES: Record<string, MemorialTemplate> = Object.fromEntries(
  ALL.map((t) => [t.id, t]),
)

export const TEMPLATE_COUNT = ALL.length
