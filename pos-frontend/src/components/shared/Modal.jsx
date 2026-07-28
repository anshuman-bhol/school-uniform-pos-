const Modal = ({ title, onClose, isOpen, children, disableClose = false, }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50" onClick={!disableClose ? onClose : undefined}>
      <div className="bg-[#1a1a1a]  w-100 max-w-lg mx-4 rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#333]">
          <h2 className="text-xl text-[#f5f5f5] font-semibold">{title}</h2>
          {!disableClose && (
            <button className="text-gray-500 text-2xl hover:text-gray-300" onClick={onClose}>
              &times;
            </button>
          )}
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
