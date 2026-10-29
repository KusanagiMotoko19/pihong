/** 做完一件事之后的回执。不大，但要看得见结果。 */
export function Toast({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="modal-mask" onClick={onClose} style={{ background: 'rgba(30,25,18,0.28)' }}>
      <div
        className="toast-card"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      >
        <div className="toast-body">{text}</div>
        <div className="toast-hint">点一下收起</div>
      </div>
    </div>
  )
}
