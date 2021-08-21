import "./viewport.sass";
import * as React from "react";
import {DraggableCore, DraggableData, DraggableEvent} from "react-draggable";

interface Coordinate {
    x: number;
    y: number;
}

interface Props {
    leftImagePath: string;
    leftError?: Error | string | null;

    rightImagePath: string;
    rightError?: Error | string | null;
}

interface State {
    anchor: Coordinate | null;
    offset: Coordinate;
    scale: number;
}

export class Viewport extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            anchor: null,
            offset: {x: 0, y: 0},
            scale: 1,
        };

        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDragMove = this.handleDragMove.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleMouseWheel = this.handleMouseWheel.bind(this);
    }

    render() {
        const {offset, scale} = this.state;
        const style = {
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        };

        return <DraggableCore
            onStart={this.handleDragStart}
            onDrag={this.handleDragMove}
            onStop={this.handleDragEnd}
        >
            <ul className="viewport" onWheel={this.handleMouseWheel}>
                <li>
                    <img alt="" src={this.props.leftImagePath} style={style} />
                </li>
                <li>
                    <img alt="" src={this.props.rightImagePath} style={style} />
                </li>
            </ul>
        </DraggableCore>;
    }

    private handleDragEnd(): void {
        this.setState({anchor: null});
    }

    private handleDragMove(ev: DraggableEvent, {x, y}: DraggableData): void {
        this.setState(p => p.anchor && {
            offset: {
              x: x - p.anchor.x,
              y: y - p.anchor.y,
            },
        });
    }

    private handleDragStart(ev: DraggableEvent, {x, y}: DraggableData): void {
        this.setState(p => ({
          anchor: {
            // We subtract because ultimately we want this in the move handler:
            // offset = mouse - mouse_original + offset_original
            // Since on the other side is doing:
            // offset = mouse - original
            // We need to negate the offset part so it is double negated
            x: x - p.offset.x,
            y: y - p.offset.y,
          },
        }));
    }

    private handleMouseWheel({
        deltaY,
        clientX,
        clientY,
        target,
    }: React.WheelEvent<HTMLUListElement>): void {
        let change = deltaY / -400;
        const max = 4 - this.state.scale;
        if (change > max)
            change = max;

        const min = 0.1 - this.state.scale;
        if (change < min)
            change = min;

        const rect = (target as HTMLElement).getBoundingClientRect();

        change && this.setState(({offset, scale}) => {
            // Transform to image centric coordniates
            const relativeX = (clientX - rect.x) - (offset.x + rect.width / 2);
            const relativeY = (clientY - rect.y) - (offset.y + rect.height / 2);

            return {
                offset: {
                    x: offset.x + (relativeX - (relativeX * (scale + change) / scale)),
                    y: offset.y + (relativeY - (relativeY * (scale + change) / scale)),
                },
                scale: scale + change,
            };
        });
    }
}