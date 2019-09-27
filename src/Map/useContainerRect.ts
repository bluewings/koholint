import { useEffect, useMemo, useState, useRef, MutableRefObject } from 'react';

type ContainerRect = {
  top: null | number;
  left: null | number;
  right: null | number;
  bottom: null | number;
  width: null | number;
  height: null | number;
};

// type HTMLElementRef = MutableRefObject<HTMLElement | null>;

const all = ['top', 'left', 'right', 'bottom', 'width', 'height'];

const useContainerRect = (
  elemRef: any,
  deps?: string[] | Function,
): ContainerRect => {
  const dependencies = (deps || '').toString();
  const mapFn = useMemo(
    () => (typeof deps === 'function' ? deps : (e: any) => e),
    [dependencies],
  );

  const hasChanged = useMemo(() => {
    if (typeof deps === 'function') {
      // return deps;

      // const tmp = watch(tmpRect);

      return (before: any, after: any) => {
        return JSON.stringify(before) !== JSON.stringify(deps(after));
      };

      // return (rectA: any, rectB: any) => {
      // };
      // return hasChanged =
      //   JSON.stringify(rect.current) !== JSON.stringify(watch(tmpRect));
    }
    const items = (deps || []).filter((e: string) => all.indexOf(e) !== -1);
    const watch = items.length > 0 ? items : all;

    return (before: any, after: any) => {
      return watch.reduce(
        (prev: boolean, key: string) => prev || before[key] !== after[key],
        false,
      );
    };
  }, [(deps || []).toString()]);

  const [rect_, setRect] = useState<any>(() =>
    mapFn({
      top: null,
      left: null,
      right: null,
      bottom: null,
      width: null,
      height: null,
    }),
  );

  const rect = useRef<any>();
  rect.current = rect_;

  const requestId = useRef<number>();

  useEffect(() => {
    const checkRect = () => {
      requestId.current && cancelAnimationFrame(requestId.current);
      if (elemRef.current && elemRef.current.parentNode) {
        const elemRect = elemRef.current.parentNode.getBoundingClientRect();
        // let hasChanged: boolean;
        // let next;
        const tmpRect: any = {
          top: elemRect.top,
          left: elemRect.left,
          right: elemRect.right,
          bottom: elemRect.bottom,
          width: elemRect.width,
          height: elemRect.height,
        };

        // if (typeof hasChanged === 'function') {
        //   // next = watch()
        //   const tmp = hasChanged(tmpRect);
        //   hasChanged =
        //     JSON.stringify(rect.current) !==
        //     JSON.stringify(hasChanged(tmpRect));
        //   // console.log(
        //   //   'case 1',
        //   //   hasChanged,
        //   //   JSON.stringify(rect.current),
        //   //   JSON.stringify(watch(tmpRect)),
        //   // );
        //   rect.current = tmp;
        // } else {
        //   hasChanged = hasChanged.reduce(
        //     (prev: boolean, key: string) =>
        //       prev || rect.current[key] !== tmpRect[key],
        //     false,
        //   );
        // }

        if (hasChanged(rect.current, tmpRect)) {
          const next = mapFn({
            top: tmpRect.top,
            left: tmpRect.left,
            right: tmpRect.right,
            bottom: tmpRect.bottom,
            width: tmpRect.width,
            height: tmpRect.height,
          });
          rect.current = next;
          // console.log('>>>>> ', next);
          setRect(next);
          return;
        }
      }
      requestId.current = requestAnimationFrame(checkRect);
    };
    checkRect();
    return () => {
      requestId.current && cancelAnimationFrame(requestId.current);
    };
  }, [elemRef.current || null, hasChanged, rect_]);

  return rect_;
};

export default useContainerRect;
