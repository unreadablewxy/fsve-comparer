import * as React from "react";

interface Props {
    path: string;
    error?: Error | string | null;
}

function renderViewport(props: Props) {
    return <div className="viewport">
        <img alt="" src={props.path} />
    </div>;
}

export const Viewport = React.memo(renderViewport);