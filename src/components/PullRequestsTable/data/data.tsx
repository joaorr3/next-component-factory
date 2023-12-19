import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
];

export const statuses = [
  {
    value: "conflicts",
    label: "Conflicts",
    icon: CrossCircledIcon,
  },
  {
    value: "failure",
    label: "Failure",
    icon: CrossCircledIcon,
  },
  {
    value: "notSet",
    label: "Not Set",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "queued",
    label: "Queued",
    icon: StopwatchIcon,
  },
  {
    value: "rejectedByPolicy",
    label: "Rejected By Policy",
    icon: CrossCircledIcon,
  },
  {
    value: "succeeded",
    label: "Succeeded",
    icon: CheckCircledIcon,
  },
];

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUpIcon,
  },
];

export const isDraft = [
  {
    label: "Yes",
    value: "y",
    icon: CheckCircledIcon,
  },
  {
    label: "No",
    value: "n",
    icon: CrossCircledIcon,
  },
];
