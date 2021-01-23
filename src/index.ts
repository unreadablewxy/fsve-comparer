import {Definition as ComparerModeDefinition} from "./mode";

export const namespace = "de.unreadableco.fs-viewer.random-ordering";

export const stylesheets = [
    new URL("extension://index.css"),
];

export const modes = [
    ComparerModeDefinition,
];