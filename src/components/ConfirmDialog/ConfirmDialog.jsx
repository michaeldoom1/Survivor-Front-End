import styles from './ConfirmDialog.module.css'

function ConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel, submitting }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        {title && <h2>{title}</h2>}
        <p>{message}</p>
        <div className={styles.actions}>
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className={styles.confirmButton} onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
