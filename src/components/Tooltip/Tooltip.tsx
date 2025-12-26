import clsx from 'clsx';
import styles from './Tooltip.module.scss';
import { useState } from 'react';

export type TooltipProps = {
  children: React.ReactNode;
  title: string;
  active: boolean;
}

export default function Tooltip({ children, title, active }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      className={clsx({
        [styles.tooltipContainer]: true,
        [styles.tooltipContainerActive]: active
      })}>
      {children}
      <span className={clsx({
        [styles.tooltip]: true,
        [styles.tooltipActive]: active && show,
      })}>
        {title}
      </span>
    </div >
  );
}