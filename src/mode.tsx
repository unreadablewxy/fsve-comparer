import "./mode.sass";
import * as React from "react";

import type {Location} from "history"
import type {ChildProcess} from "child_process"

import {Viewport} from "./viewport";
import {ItemProps, Properties} from "./properties";

interface MediaInfoResponse {
    format: string;
    width: number;
    height: number;
    bitDepth: number;
    lossy: boolean;
    size: number;
}

function invokeMediaInfo(invoker: any, file: string): Promise<MediaInfoResponse> {
    return new Promise((resolve, reject) => {
        const proc: ChildProcess = invoker.spawn("/usr/bin/mediainfo", "--Output=JSON", file);
        if (proc.stdout) {
            let outputText = "";

            proc.stdout.on("data", (chunk) => {
                outputText += chunk.toString();
            });

            proc.stdout.on("end", () => {
                try {
                    const {track} = JSON.parse(outputText).media;
                    const output = track.find(t => t["@type"] !== "General");
                    const general = track.find(t => t["@type"] === "General");
                    resolve({
                        format: output["Format"],
                        width: output["Width"],
                        height: output["Height"],
                        bitDepth: output["BitDepth"],
                        lossy: output["Compression_Mode"] === "Lossy",
                        size: general["FileSize"],
                    });
                } catch (e) {
                    reject(e);
                }
            });

            proc.stdout.on("error", reject);
        }
    });
}

function toFormatString({format, lossy}: MediaInfoResponse): string {
    return `${format}${lossy ? " lossy" : ""}`;
}

function compareFormat(a?: MediaInfoResponse, b?: MediaInfoResponse): ItemProps {
    const result = {
        label: "Format",
        left: "",
        right: "",
    };

    if (a)
        result.left = toFormatString(a);

    if (b)
        result.right = toFormatString(b);

    return result;
}

function compareNumericProperty(label: string, a?: number, b?: number): ItemProps {
    return {
        label,
        left: String(a),
        right: String(b),
    };
}

const sizeUnits = ["Bytes", "KB", "MB", "GB", "TB"];
function abbreviateSize(size: number): string {
    let n = 0;
    for (; n < sizeUnits.length; ++n) {
        const value = size / Math.pow(1024, n);
        if (value < 1024) {
            size = Math.trunc(value * 100) / 100;
            break;
        }
    }

    return `${size} ${sizeUnits[n]}`;
}

function compareSizeProperty(a?: number, b?: number): ItemProps {
    return {
        label: "Size",
        left: a ? abbreviateSize(a) : "unknown",
        right: b ? abbreviateSize(b) : "unknown",
    };
}

function compareProperties(a?: MediaInfoResponse, b?: MediaInfoResponse): Array<ItemProps> {
    return [
        compareFormat(a, b),
        compareSizeProperty(a?.size, b?.size),
        compareNumericProperty("Width", a?.width, b?.width),
        compareNumericProperty("Height", a?.height, b?.height),
    ];
}

interface PreferenceMappedProps {
}

interface Props extends PreferenceMappedProps {
    ipc: any;

    leftFile: string;
    rightFile: string;
}

interface State {
    comparisons: Array<ItemProps> | null;
    leftError: Error | string | null;
    rightError: Error | string | null;
}

export class Comparer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            comparisons: null,
            leftError: null,
            rightError: null,
        };
    }

    componentDidMount() {
        const {ipc, leftFile, rightFile} = this.props;

        Promise.allSettled([
            invokeMediaInfo(ipc, leftFile),
            invokeMediaInfo(ipc, rightFile),
        ]).then(([left, right]) => {
            const patch: Partial<State> = {};

            if (left.status === "rejected")
                patch.leftError = left.reason;

            if (right.status === "rejected")
                patch.rightError = right.reason;

            patch.comparisons = compareProperties(
                (left as PromiseFulfilledResult<MediaInfoResponse>).value,
                (right as PromiseFulfilledResult<MediaInfoResponse>).value,
            );

            this.setState(patch as State);
        });
    }

    render(): React.ReactNode {
        const {leftFile, rightFile} = this.props; 
        return <section className="uc-fsv-comparer">
            <Viewport path={leftFile}
                error={this.state.leftError}
            />
            <Viewport path={rightFile}
                error={this.state.rightError}
            />
            <Properties items={this.state.comparisons}
                leftFile={leftFile}
                rightFile={rightFile}
            />
        </section>;
    }
}

export const Definition = {
    id: "comparer",
    path: "/compare",
    services: ["ipc"],
    component: Comparer,
    selectRouteParams: (location: Location) => {
        const url = new URL(`file:///compare${location.search}`);

        return {
            leftFile: url.searchParams.get("left"),
            rightFile: url.searchParams.get("right"),
        };
    },
};