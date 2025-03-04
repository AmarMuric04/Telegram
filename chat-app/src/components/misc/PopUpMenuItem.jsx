import PropTypes from "prop-types";

export default function PopUpMenuItem({ itemClasses, action, children }) {
  return (
    <button
      role="menuitem"
      onClick={action}
      className={`theme-hover-bg-2 relative z-50 w-full ${
        itemClasses && itemClasses
      }  cursor-pointer flex gap-2 items-center  transition-all p-2 rounded-md text-[16px]`}
    >
      {children}
    </button>
  );
}

PopUpMenuItem.propTypes = {
  action: PropTypes.func.isRequired,
  icon: PropTypes.node,
  itemClasses: PropTypes.string,
  children: PropTypes.node,
};
