import { HelpCircle, Info, Lightbulb, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

export function HelpButton({
  label = 'ヘルプを開く',
  title = 'この画面の見方',
  body = 'この項目で確認すべきポイントを短く説明します。',
  children,
  placement = 'bottom-start',
  initiallyOpen = false
}) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [position, setPosition] = useState(null);
  const popoverId = useId();
  const triggerRef = useRef(null);

  function updatePosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = 360;
    const height = 120;
    const padding = 12;
    let left = rect.left;
    let top = rect.bottom + 8;
    const maxLeft = window.innerWidth - width - padding;
    if (left > maxLeft) left = Math.max(padding, maxLeft);
    if (left < padding) left = padding;
    if (top + height > window.innerHeight - padding) {
      top = Math.max(padding, rect.top - height - 8);
    }
    setPosition({ left, top, width });
  }

  useLayoutEffect(() => {
    if (isOpen) updatePosition();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleUpdate = () => updatePosition();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [isOpen]);

  return (
    <span className={`bh-help-button bh-help-button--${placement}`}>
      <button
        type="button"
        className="bh-help-button__trigger"
        ref={triggerRef}
        aria-label={label}
        aria-expanded={isOpen}
        aria-controls={popoverId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <HelpCircle size={16} aria-hidden="true" />
      </button>
      {isOpen && position ? createPortal(
        <div
          className="bh-help-button__popover"
          id={popoverId}
          role="note"
          style={{ left: `${position.left}px`, top: `${position.top}px`, width: `${position.width}px` }}
        >
          <div className="bh-help-button__content">
            <div className="bh-help-button__head">
              <strong>{title}</strong>
              <button type="button" className="bh-help-button__close" aria-label="ヘルプを閉じる" onClick={() => setIsOpen(false)}>
                <X size={14} aria-hidden="true" />
              </button>
            </div>
            <span>{children || body}</span>
          </div>
        </div>,
        document.body
      ) : null}
    </span>
  );
}

export function HelpPanel({
  title = '画面のポイント',
  body = 'この画面では、判断に必要な情報だけを確認します。',
  items = [],
  tone = 'default',
  children
}) {
  return (
    <aside className={`bh-help-panel bh-help-panel--${tone}`} aria-label={title}>
      <div className="bh-help-panel__header">
        <Info size={18} aria-hidden="true" />
        <h3>{title}</h3>
      </div>
      {children ? <div className="bh-help-panel__body">{children}</div> : <p className="bh-help-panel__body">{body}</p>}
      {items.length > 0 ? (
        <ul className="bh-help-panel__list">
          {items.map((item) => (
            <li className="bh-help-panel__item" key={item}>
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}

export function FieldHint({ text = '入力内容の補足です。', label = '補足', children }) {
  return (
    <span className="bh-field-hint" aria-label={label}>
      <Info size={14} aria-hidden="true" />
      <span className="bh-field-hint__text">{children || text}</span>
    </span>
  );
}

export function OnboardingNudge({
  title = 'まずここを確認',
  body = '初回はこの情報を見ると、次の操作を判断しやすくなります。',
  actionLabel,
  onAction,
  onDismiss,
  children
}) {
  return (
    <aside className="bh-onboarding-nudge" role="note" aria-label={title}>
      <div className="bh-onboarding-nudge__icon">
        <Lightbulb size={18} aria-hidden="true" />
      </div>
      <div className="bh-onboarding-nudge__content">
        <h3>{title}</h3>
        {children ? <div className="bh-onboarding-nudge__body">{children}</div> : <p className="bh-onboarding-nudge__body">{body}</p>}
        {(actionLabel && onAction) || onDismiss ? (
          <div className="bh-onboarding-nudge__actions">
            {actionLabel && onAction ? (
              <button type="button" className="bh-onboarding-nudge__action" onClick={onAction}>
                {actionLabel}
              </button>
            ) : null}
            {onDismiss ? (
              <button type="button" className="bh-onboarding-nudge__dismiss" aria-label="案内を閉じる" onClick={onDismiss}>
                <X size={14} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
