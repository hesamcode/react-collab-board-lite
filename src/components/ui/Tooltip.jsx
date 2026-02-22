import { isValidElement, cloneElement } from "react";

export default function Tooltip({ label, children }) {
  if (!isValidElement(children)) {
    return children;
  }

  return cloneElement(children, {
    title: children.props.title ?? label,
  });
}
