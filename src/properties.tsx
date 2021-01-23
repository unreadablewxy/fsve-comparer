import * as React from "react";

export interface ItemProps {
    label: string;
    left: string;
    right: string;
}

function renderItem({label, left, right}: ItemProps) {
    return <li>
        <div className="label">{label}</div>
        <div>
            <span>{left}</span>
            <span>{right}</span>
        </div>
    </li>;
}

interface Props {
    items: ReadonlyArray<ItemProps> | null;
    leftFile: string;
    rightFile: string;
}

function renderProperties({items, leftFile, rightFile}: Props) {
    return <ul className="properties">
        {items ? items.map(renderItem) : <li>Loading...</li>}
        <li>
            <div>
                <span>{leftFile}</span>
                <span>{rightFile}</span>
            </div>
        </li>
    </ul>;
}

export const Properties = React.memo(renderProperties);