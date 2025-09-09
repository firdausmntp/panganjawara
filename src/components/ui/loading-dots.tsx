interface LoadingDotsProps {
  className?: string;
}

const LoadingDots = ({ className = "" }: LoadingDotsProps) => {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
    </div>
  );
};

export default LoadingDots;
