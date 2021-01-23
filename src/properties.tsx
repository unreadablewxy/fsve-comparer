import * as React from "react";

export interface ItemProps {
    label: string;
    left: string;
    right: string;
}

function renderItem({left, right}: ItemProps) {
    return <li>
        <span>{left}</span>
        <span>{right}</span>
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
            <span>{leftFile}</span>
            <span>{rightFile}</span>
        </li>
    </ul>;
}

export const Properties = React.memo(renderProperties);