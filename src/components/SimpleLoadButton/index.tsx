import { LeapFrog } from "@uiball/loaders";
import React from "react";

const SimpleLoadButton = (props: any) => {
    return (
        <>
            <button
                id="nextButtonToken"
                ref={props.ref}
                className={"button"}
                disabled={props.disabled}
                onClick={props.onClick}
                style={{
                    height: props.height,
                    width: props.width,
                    fontSize: props.fontsize,
                    fontWeight: props.fontweight,
                    background: props.bgColor,
                    color: props.color ? props.color : "#FFF"
                }}
            >
                {props.condition ? (
                    <>
                        <div className="loader">
                            <LeapFrog size={25} color="#FFFFFF" />
                        </div>
                    </>
                ) : (
                    props.title
                )}
            </button>
        </>
    );
};

export default SimpleLoadButton;
