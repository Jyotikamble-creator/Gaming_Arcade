// Breadcrumbs component for Memory Card Game
const Breadcrumbs = ({ path = [] }) => {
  return (
    <div className="text-sm text-subtle-text mb-6">
      {path.map((item, index) => (
        <React.Fragment key={index}>
          <a
            href={item.link || "#"}
            className={`hover:text-white ${index === path.length - 1 ? 'text-white font-medium' : ''}`}
          >
            {item.label}
          </a>
          {index < path.length - 1 && <span className="mx-2">&gt;</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;