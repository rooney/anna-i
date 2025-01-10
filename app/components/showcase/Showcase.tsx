import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import useSize from '@react-hook/size';
import { clsx } from 'clsx';
import { type Product } from '~/models/product';
import css from './showcase.module.css';

interface ShowcaseProps extends React.HTMLAttributes<HTMLUListElement> {
  products: Product[];
}

export interface ShowcaseElement extends HTMLUListElement {
  handleClick: (_:React.MouseEvent<HTMLElement>) => void;
}

export const Showcase = forwardRef<ShowcaseElement, ShowcaseProps>(
  ({products, className, onClick, ...props}, ref) => {
    const
      showcase = useRef<HTMLUListElement>(null),
      [focus, setFocus] = useState<number>(-1),
      [unfocus, setUnfocus] = useState<number>(-1),
      [numCols, setNumCols] = useState<number>(1),
      [showcaseWidth, _] = useSize(showcase);

      useEffect(() => {
        const
          numCols = Math.floor((showcaseWidth + 5) / 105),
          numColsHanging = products.length % numCols,
          usedWidth        = 105 * numCols - 5,
          usedWidthHanging = 105 * numColsHanging - 5,
          unusedWidth        = showcaseWidth - usedWidth,
          unusedWidthHanging = showcaseWidth - usedWidthHanging,
          xPush        = Math.max(0, 90 - unusedWidth/2),
          xPushHanging = Math.max(0, 90 - unusedWidthHanging/2),
          style = showcase.current!.style;

        style.setProperty('--x-push', `${xPush}px`);
        style.setProperty('--x-push-hanging', `${xPushHanging}px`);
        setNumCols(numCols);

      }, [showcaseWidth]);

    function handleClick(e: React.MouseEvent<HTMLElement>) {
      const target = (e.target as HTMLElement);
      if (showcase.current?.contains(target) && target.matches('img, figcaption')) return;
      setFocus(-1);
    }

    useImperativeHandle(ref, () => ({ ...showcase.current!, handleClick }));
    
    return useMemo(() => {
      const
        numRows = Math.ceil(products.length / numCols),
        lastIndex = products.length - 1,
        hasFocus = focus > -1,
        focusRow = Math.floor(focus / numCols),
        focusCol = hasFocus ? focus - (focusRow * numCols) : -1,
        isFocusFirstCol = focusCol === 0,
        isFocusLastCol = focusCol === numCols - 1 || focus === lastIndex,
        isFocusAtEdge = isFocusFirstCol || isFocusLastCol,
        isLastRowHanging = products.length < numRows * numCols;

      return <ul {...props} ref={showcase} className={clsx(className, css.showcase, products.length === 1 && css.one)}
        onClick={(e) => {
          if (onClick) onClick(e);
          if (!e.defaultPrevented) handleClick(e);
        }}>
        {products.map((product, index) => {
          const
            rowIndex = Math.floor(index / numCols),
            colIndex = index - (rowIndex * numCols),
            isFirstCol = colIndex === 0,
            isLastCol = colIndex === numCols - 1 || index === lastIndex,
            isLastRow = rowIndex === numRows - 1,
            isFocusRow = rowIndex === focusRow,
            isHanging = isLastRow && isLastRowHanging,
            isLeading = isFirstCol && !isLastCol,
            isTrailing = isLastCol && !isFirstCol,
            isPortrait = product.image.height > product.image.width,
            productName = product.name.replace(/ /g, '\u00A0').replace(/-/g, '\u2011');

          function toggleFocus(e: React.SyntheticEvent<HTMLElement>) {
            setUnfocus(focus);
            setFocus(focus === index ? -1 : index);
          }

          function clearOut(e: React.SyntheticEvent<HTMLElement>) {
            setUnfocus(-1);
          }

          return <li key={index}>
            <figure onClick={toggleFocus} onTransitionEnd={clearOut}
              className={clsx(
                isPortrait && css.portrait,
                isHanging && css.hanging,
                isLeading && css.leading,
                isTrailing && css.trailing,
                isFocusRow && isFocusAtEdge && css.edge,
                focus > -1 && (
                  rowIndex < focusRow ? css.upward :
                  rowIndex > focusRow ? css.downward :
                  colIndex < focusCol ? css.leftward :
                  colIndex > focusCol ? css.rightward :
                                        css.outward
                ), index === unfocus && css.inward,
              )} >
              <img src={product.image.src}/>
              <figcaption>{productName}</figcaption>
              <a>{productName}</a>
            </figure>
          </li>;
        })}
      </ul>
    }, [products, focus, unfocus, numCols]);
  }
);

export default Showcase;
