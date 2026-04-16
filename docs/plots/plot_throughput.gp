set terminal pdfcairo enhanced color font 'Times,12'
set output 'throughput_vs_clients.pdf'

set title "Throughput vs. Number of Clients"
set xlabel "Number of Clients"
set ylabel "Throughput (ops/sec)"

set grid
set key outside top center horizontal
set style line 1 lc rgb '#1f77b4' lw 1.5

plot 'data_throughput.dat' using 1:2 with lines ls 1 title 'Throughput'
