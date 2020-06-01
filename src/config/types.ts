// eslint-disable-next-line import/no-cycle
import CastVoteRecordFiles from '../utils/CastVoteRecordFiles'

// Generic
export interface Dictionary<T> {
  [key: string]: T | undefined
}

// Events
export type InputEventFunction = (
  event: React.FormEvent<HTMLInputElement>
) => void | Promise<void>
export type ButtonEventFunction = (
  event: React.MouseEvent<HTMLButtonElement>
) => void | Promise<void>

// Candidates
export interface Candidate {
  readonly id: string
  readonly name: string
  readonly partyId?: string
  isWriteIn?: boolean
}
export type OptionalCandidate = Candidate | undefined

// Contests
export type ContestTypes = 'candidate' | 'yesno'
export interface Contest {
  readonly id: string
  readonly districtId: string
  readonly partyId?: string
  readonly section: string
  readonly title: string
  readonly type: ContestTypes
}
export interface CandidateContest extends Contest {
  readonly type: 'candidate'
  readonly seats: number
  readonly candidates: Candidate[]
  readonly allowWriteIns: boolean
}
export interface YesNoContest extends Contest {
  readonly type: 'yesno'
  readonly description: string
  readonly shortTitle: string
}
export type Contests = (CandidateContest | YesNoContest)[]

// Election
export interface BMDConfig {
  readonly requireActivation?: boolean
  readonly showHelpPage?: boolean
  readonly showSettingsPage?: boolean
}
export interface ElectionDefaults {
  readonly bmdConfig: BMDConfig
}
export interface BallotStyle {
  readonly id: string
  readonly precincts: string[]
  readonly districts: string[]
  readonly partyId?: string
}
export interface Party {
  readonly id: string
  readonly name: string
  readonly abbrev: string
}
export type Parties = Party[]
export interface Precinct {
  readonly id: string
  readonly name: string
}
export interface District {
  readonly id: string
  readonly name: string
}
export interface Election {
  readonly ballotStyles: BallotStyle[]
  readonly parties: Parties
  readonly precincts: Precinct[]
  readonly districts: District[]
  readonly contests: Contests
  readonly county: string
  readonly date: string
  readonly seal: string
  readonly state: string
  readonly title: string
  readonly bmdConfig?: BMDConfig
}
export type OptionalElection = Election | undefined

export type SetElection = (value: OptionalElection) => void

export interface ActivationData {
  ballotStyle: BallotStyle
  precinct: Precinct
}

// Votes
export type CandidateVote = Candidate[]
export type YesNoVote = 'yes' | 'no'
export type OptionalYesNoVote = YesNoVote | undefined
export type Vote = CandidateVote | YesNoVote
export type OptionalVote = Vote | undefined
export type VotesDict = Dictionary<Vote>

export type VotesByPrecinct = Dictionary<VotesDict[]>

// Tallies
export type ContestOption = Candidate | 'yes' | 'no'
export interface ContestOptionTally {
  option: ContestOption
  tally: number
}

export interface ContestTally {
  contest: Contest
  tallies: ContestOptionTally[]
}

export interface ElectionTally {
  precinctId: string | undefined
  contestTallies: ContestTally[]
}

export interface FullElectionTally {
  precinctTallies: Dictionary<ElectionTally>
  overallTally: ElectionTally
}

// Cast Vote Record

export interface CastVoteRecord
  extends Dictionary<boolean | string | string[]> {
  _precinctId: string
  _ballotId: string
  _ballotStyleId: string
  _testBallot: boolean
}

// Smart Card Content
export type CardDataTypes = 'voter' | 'pollworker' | 'clerk'
export interface CardData {
  readonly t: CardDataTypes
}
export interface VoterCardData extends CardData {
  readonly t: 'voter'
  readonly bs: string
  readonly pr: string
  readonly uz?: number
}
export interface PollworkerCardData extends CardData {
  readonly t: 'pollworker'
  readonly h: string
}
export interface ClerkCardData extends CardData {
  readonly t: 'clerk'
  readonly h: string
}

// Screens
export type SetScreenFunction = (newScreen: string) => void
export interface ScreenProps {
  election: Election
  setElection?: SetElection
  setCurrentScreen: SetScreenFunction
}

// Cast Vote Records
export interface CastVoteRecordFile {
  readonly name: string
  readonly count: number
  readonly precinctIds: readonly string[]
}
export type CastVoteRecordFilesDictionary = Dictionary<CastVoteRecordFile>
export type SetCastVoteRecordFilesFunction = React.Dispatch<
  React.SetStateAction<CastVoteRecordFiles>
>
