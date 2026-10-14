// Stable lesson API: implementations and styles are grouped by component role.
export { CodeBlock } from "../shared/ui/code-editor/CodeEditor";
export { RichLesson, RichHero, Section, Lead, LinkedNotes, Callout, TypeCards, TypeCard, MethodGrid, PracticeCta, KeyTakeaways, TheoryBridge } from "./components/layout";
export { CodeSequence, BugHunt, CompareSolutions } from "./components/code-exercises";
export { RecallCard, QuizCard, TrueFalse } from "./components/questions";
export { PredictOutput, StepThrough, FillBlank, TerminalDemo, BranchExplorer } from "./components/code-demos";
export { MatchPairs, SliceExplorer, FlipCards } from "./components/explorations";
export { Diagram, DiagramFlow, DiagramNode, DiagramArrow, DiagramGroup, DiagramLane, DiagramBranches, DiagramBranch, DiagramNote, DiagramLegend, DiagramExchange, DiagramTrack } from "./components/diagrams";
export type { DiagramOrientation, DiagramNodeShape, DiagramArrowDirection, DiagramArrowStyle } from "./components/diagrams";
