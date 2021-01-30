import {Definition as ComparerModeDefinition} from "./mode";

export const namespace = "de.unreadableco.fs-viewer.comparer";

export const stylesheets = [
    new URL("extension://index.css"),
];

export const modes = [
    ComparerModeDefinition,
];