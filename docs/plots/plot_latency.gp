set terminal pdfcairo enhanced color font 'Times,12'
set output 'latency_vs_clients.pdf'

set title "Latency vs. Number of Clients"
set xlabel "Number of Clients"
set ylabel "Latency (ms)"

set grid
set key outside top center horizontal
set style line 1 lc rgb '#1f77b4' lw 2 pt 7 ps 1.2

plot 'data_latency.dat' using 1:2 with lines ls 1 title 'Latency'