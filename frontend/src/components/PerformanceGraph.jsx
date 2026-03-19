import { useEffect, useRef } from 'react';

function PerformanceGraph({ performanceData }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && performanceData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set canvas size
      const width = canvas.width;
      const height = canvas.height;
      const padding = 40;
      const graphWidth = width - 2 * padding;
      const graphHeight = height - 2 * padding;

      // Data points
      const data = [
        { label: 'LeetCode Solved', value: performanceData.leetcode.solved },
        { label: 'CodeChef Solved', value: performanceData.codechef.solved },
        { label: 'HackerRank Hackos', value: performanceData.hackerrank.solved },
        { label: 'GitHub Commits', value: Math.min(performanceData.github.commits, 100) } // Cap for display
      ];

      const maxValue = Math.max(...data.map(d => d.value), 1);
      const barWidth = graphWidth / data.length - 20;
      const spacing = 20;

      // Draw axes
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

      // Draw bars
      data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * graphHeight;
        const x = padding + index * (barWidth + spacing) + spacing / 2;
        const y = height - padding - barHeight;

        // Draw bar
        ctx.fillStyle = '#374151';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw value on top of bar
        ctx.fillStyle = '#111827';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);

        // Draw label
        ctx.fillStyle = '#6B7280';
        ctx.font = '11px sans-serif';
        ctx.save();
        ctx.translate(x + barWidth / 2, height - padding + 15);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(item.label, 0, 0);
        ctx.restore();
      });

      // Draw title
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Performance Metrics', width / 2, 20);
    }
  }, [performanceData]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        className="w-full border border-gray-200 rounded-lg"
      />
    </div>
  );
}

export default PerformanceGraph;
