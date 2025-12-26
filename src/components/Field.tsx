import React, { DetailedHTMLProps, HTMLInputTypeAttribute, HtmlHTMLAttributes, InputHTMLAttributes } from "react";

type Ref = HTMLInputElement;

interface FieldProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
}

export const LoginField = React.forwardRef<Ref, FieldProps>((props, ref) => {
  return (
    <input ref={ref} {...props} />
  )
});

LoginField.displayName = 'LoginField';