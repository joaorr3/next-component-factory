import { startCase } from "lodash";
import React from "react";
import tw from "tailwind-styled-components";
import { type FormSchema } from "./IssueForm/models";

const baseTag = () => /*tw*/ `

  max-w-max
  flex
  items-center
  rounded-full

  bg-opacity-80
  px-2
  py-1
  font-bold
  text-xs
  border-2
  select-none
`;

const bugTag = () => /*tw*/ `
   bg-red-800
   text-red-400
   border-red-800
`;
const helpTag = () => /*tw*/ `
   bg-blue-800
   text-blue-400
   border-blue-800
`;
const featTag = () => /*tw*/ `
   bg-green-800
   text-green-400
   border-green-800
`;
const crTag = () => /*tw*/ `
   bg-purple-800
   text-purple-400
   border-purple-800
`;

const map: Record<FormSchema["type"], () => string> = {
  bug: bugTag,
  help: helpTag,
  feat: featTag,
  cr: crTag,
};

const TwTag = tw.div<{ $type: FormSchema["type"] }>`
  ${baseTag}
  ${(p) => map[p.$type]()}
`;

export type TagProps = Pick<FormSchema, "type">;

export const Tag = ({ type }: TagProps): JSX.Element => {
  return <TwTag $type={type}>{startCase(type)}</TwTag>;
};
