/** biome-ignore-all lint/suspicious/noExplicitAny: library file */
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Separator } from "@repo/ui/components/separator";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { Skeleton } from "@repo/ui/components/skeleton";
import { MoreHorizontal } from "lucide-react";
import {
  Children,
  createContext,
  Fragment,
  type MouseEventHandler,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface HeaderActionData {
  children: ReactNode;
  onClick?: MouseEventHandler<any>;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "icon" | "sm" | "md" | "lg" | "icon-sm" | "icon-lg" | undefined;
  render?: (props: any) => ReactNode;
  renderProps?: any;
}

interface ActionEntry {
  id: string;
  action: HeaderActionData;
}

interface TitleContextType {
  title?: string;
  setTitle: (title?: string) => void;
}

interface ActionsContextType {
  actions: ActionEntry[];
  setActions: (actions: ActionEntry[]) => void;
  addAction: (id: string, action: HeaderActionData) => void;
  removeAction: (id: string) => void;
  updateActionProps: (id: string, props: any) => void;
  visibleActions: ActionEntry[];
  overflowActions: ActionEntry[];
}

const TitleContext = createContext<TitleContextType | undefined>(undefined);
const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

function useResizeObserver(
  ref: React.RefObject<HTMLElement | null>,
  callback: (entry: ResizeObserverEntry) => void
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      callback(entries[0]);
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [callback, ref]);
}

function HeaderRoot() {
  const { title } = useTitle();
  const { visibleActions, overflowActions } = useActions();
  const headerRef = useRef<HTMLDivElement>(null);
  const [_, setAvailableWidth] = useState(0);

  const handleResize = useCallback(
    (entry: ResizeObserverEntry) => {
      const headerElement = headerRef.current;
      if (!headerElement) return;

      const titleSection = headerElement.querySelector(
        "[data-title-section]"
      ) as HTMLElement;
      const titleWidth = titleSection?.offsetWidth || 0;
      const padding = 32;
      const dropdownWidth = overflowActions.length > 0 ? 40 : 0;

      setAvailableWidth(
        entry.contentRect.width - titleWidth - padding - dropdownWidth
      );
    },
    [overflowActions.length]
  );

  useResizeObserver(headerRef, handleResize);

  const renderAction = ({ id, action }: ActionEntry) => {
    if (action.render) {
      return (
        <Fragment key={id}>{action.render(action.renderProps || {})}</Fragment>
      );
    }

    const childrenArray = Children.toArray(action.children);
    return (
      <Button
        className="flex items-center gap-2"
        disabled={action.disabled}
        key={id}
        onClick={action.onClick}
        size={action.size}
        variant={action.variant}
      >
        {childrenArray.map((child, index) =>
          typeof child === "string" ? (
            <span className="hidden sm:inline" key={index}>
              {child}
            </span>
          ) : (
            child
          )
        )}
      </Button>
    );
  };

  return (
    <header
      className="mb-2 flex h-24 w-full items-center gap-3 rounded-md bg-background px-4 py-2"
      ref={headerRef}
    >
      <div
        className="flex min-w-0 flex-1 items-center gap-2 py-4"
        data-title-section
      >
        <SidebarTrigger className="flex-shrink-0 p-2 text-lg text-muted-foreground transition-colors hover:text-foreground" />
        {title ? (
          <>
            <Separator className="h-6 opacity-30" orientation="vertical" />
            <h1 className="min-w-0 truncate p-2 font-medium text-lg tracking-tight">
              {title}
            </h1>
          </>
        ) : (
          <>
            <Separator className="h-6 opacity-30" orientation="vertical" />
            <Skeleton className="h-6 w-32" />
          </>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {visibleActions.map(renderAction)}

        {overflowActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(props) => (
                <Button size="sm" variant="outline" {...props}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              )}
            />
            <DropdownMenuContent className="w-56">
              {overflowActions.map(({ id, action }) => (
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  disabled={action.disabled}
                  key={id}
                  onClick={action.onClick}
                >
                  {action.children}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

function TitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string | undefined>(undefined);

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {children}
    </TitleContext.Provider>
  );
}

function ActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ActionEntry[]>([]);
  const [visibleActions, setVisibleActions] = useState<ActionEntry[]>([]);
  const [overflowActions, setOverflowActions] = useState<ActionEntry[]>([]);

  const addAction = useCallback((id: string, action: HeaderActionData) => {
    setActions((prev) => {
      const index = prev.findIndex((entry) => entry.id === id);
      if (index > -1) {
        const newActions = [...prev];
        newActions[index] = { id, action };
        return newActions;
      }
      return [...prev, { id, action }];
    });
  }, []);

  const removeAction = useCallback((id: string) => {
    setActions((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const updateActionProps = useCallback((id: string, props: any) => {
    setActions((prev) => {
      const index = prev.findIndex((entry) => entry.id === id);
      if (index > -1) {
        const newActions = [...prev];
        newActions[index] = {
          ...newActions[index],
          action: {
            ...newActions[index].action,
            renderProps: props,
          },
        };
        return newActions;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const maxVisibleActions =
        window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 4;

      if (actions.length <= maxVisibleActions) {
        setVisibleActions(actions);
        setOverflowActions([]);
      } else {
        setVisibleActions(actions.slice(0, maxVisibleActions));
        setOverflowActions(actions.slice(maxVisibleActions));
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [actions]);

  return (
    <ActionsContext.Provider
      value={{
        actions,
        setActions,
        addAction,
        removeAction,
        updateActionProps,
        visibleActions,
        overflowActions,
      }}
    >
      {children}
    </ActionsContext.Provider>
  );
}

function Provider({ children }: { children: ReactNode }) {
  return (
    <TitleProvider>
      <ActionsProvider>{children}</ActionsProvider>
    </TitleProvider>
  );
}

function useTitle() {
  const context = useContext(TitleContext);
  if (context === undefined) {
    throw new Error("useTitle must be used within a TitleProvider");
  }
  return context;
}

function useActions() {
  const context = useContext(ActionsContext);
  if (context === undefined) {
    throw new Error("useActions must be used within an ActionsProvider");
  }
  return context;
}

function Title({ children }: { children?: string }) {
  const { setTitle } = useTitle();
  useEffect(() => {
    setTitle(children);
    return () => setTitle(undefined);
  }, [children, setTitle]);
  return null;
}

interface ActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
  onClick?: MouseEventHandler<any>;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "icon" | "sm" | "md" | "lg" | "icon-sm" | "icon-lg";
  children: ReactNode;
}

function Action(props: ActionProps) {
  const { addAction, removeAction } = useActions();
  const actionIdRef = useRef(
    props.id || `action-${Math.random().toString(36).substr(2, 9)}`
  );
  const actionId = actionIdRef.current;

  useEffect(() => {
    addAction(actionId, props);
    return () => removeAction(actionId);
  }, [actionId, addAction, removeAction, props]);

  return null;
}

function Actions({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function defineTanstackRouteHead(title: string) {
  return {
    head: () => ({ meta: [{ title }] }),
  };
}

export {
  HeaderRoot,
  Title,
  Action,
  Actions,
  Provider,
  useTitle,
  useActions,
  defineTanstackRouteHead,
};
