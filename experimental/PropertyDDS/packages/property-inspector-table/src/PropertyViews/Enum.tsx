/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type {
	ContainerProperty,
	EnumArrayProperty,
} from "@fluid-experimental/property-properties";
import MenuItem from "@material-ui/core/MenuItem";
import Select, { type SelectProps } from "@material-ui/core/Select";
import * as React from "react";

import type { IEditableValueCellProps, IInspectorRow } from "../InspectorTableTypes.js";
import { getPropertyValue } from "../propertyInspectorUtils.js";
import { Utils } from "../typeUtils.js";

type ValType = string | number | boolean;

type EnumProps = IEditableValueCellProps & {
	onSubmit: (val: ValType, props: IEditableValueCellProps) => void;
	SelectProps: SelectProps;
	classes: Record<"container" | "tooltip" | "info" | "input" | "textField", string>;
};

type GetOptionsType = (rowData: IInspectorRow) => string[];

const getOptions: GetOptionsType = (rowData) => {
	const enumObj: EnumArrayProperty = Utils.isEnumArrayProperty(rowData.parent!)
		? rowData.parent
		: (rowData.parent! as ContainerProperty).get(rowData.name)!;

	return Object.keys((enumObj as any)._enumDictionary.enumEntriesById);
};

export const EnumView: React.FunctionComponent<EnumProps> = (props) => {
	const {
		followReferences,
		SelectProps: selectProps,
		rowData,
		onSubmit,
		classes,
		readOnly,
	} = props;

	const options = getOptions(rowData);
	const value = getPropertyValue(
		rowData.parent as ContainerProperty,
		rowData.name,
		rowData.context,
		rowData.typeid,
		followReferences,
	);

	return (
		<Select
			key={`${rowData.id}${value}`}
			onChange={(event) => onSubmit(event.target.value as ValType, props)}
			value={value}
			disabled={rowData.isConstant || rowData.parentIsConstant || readOnly}
			className={classes.textField}
			{...selectProps}
		>
			{options.map((option, index) => (
				<MenuItem key={index} value={option}>
					{option}
				</MenuItem>
			))}
		</Select>
	);
};
