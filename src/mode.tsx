import "./mode.sass";
import * as React from "react";

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

async function invokeMediaInfo(invoker: any, file: string): Promise<MediaInfoResponse> {
    const outputText = await invoker.invoke("/usr/bin/mediainfo", "--Output=JSON", file);
    const {track} = JSON.parse(outputText);
    const output = track.find(t => t["@type"] !== "General");
    return {
        format: output["Format"],
        width: output["Width"],
        height: output["Height"],
        bitDepth: output["BitDepth"],
        lossy: output["Compression_Mode"] === "Lossy",
        size: output["StreamSize"],
    };
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

function compareProperties(a?: MediaInfoResponse, b?: MediaInfoResponse): Array<ItemProps> {
    return [
        compareFormat(a, b),
        compareNumericProperty("size", a?.size, b?.size),
        compareNumericProperty("width", a?.width, b?.width),
        compareNumericProperty("height", a?.height, b?.height),
    ];
}

interface PreferenceMappedProps {
}

interface Props extends PreferenceMappedProps {
    invoker: any;

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
        const {invoker, leftFile, rightFile} = this.props;

        Promise.allSettled([
            invokeMediaInfo(invoker, leftFile),
            invokeMediaInfo(invoker, rightFile),
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

            return patch as State;
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
    path: "/comparer",
    services: ["invoker"],
    component: Comparer,
};