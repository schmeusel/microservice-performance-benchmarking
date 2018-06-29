import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import { fade } from 'material-ui/utils/colorManipulator';
import { MeasurementsPropTypes } from '../../../constants/CustomPropTypes';
import { Palette } from '../../../constants/Theme';

export default class MeasurementsHistogram extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string.isRequired,
        sequenceIndex: PropTypes.number.isRequired,
        measurements: MeasurementsPropTypes.isRequired,
        groupingDistance: PropTypes.number.isRequired,
    };

    constructor(props) {
        super(props);
        this.chart = null;
        this.canvasId = `${props.name}_${props.sequenceIndex}_histogram`;
    }

    componentDidMount() {
        const ctx = document.getElementById(this.canvasId)
            .getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: this.getChartsData(this.props),
            options: this.getChartOptions(this.props),
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.chart) {
            this.chart.data = this.getChartsData(nextProps);
            this.chart.options = this.getChartOptions(nextProps);
            this.chart.update();
        }
    }

    getLatencyMap(keysMap, latencies, groupingDistance) {
        const smallestKey = parseInt(Object.keys(keysMap).shift());
        return latencies.reduce((map, num) => {
            const key = (Math.floor((num - smallestKey) / groupingDistance) * groupingDistance) + smallestKey;
            return {
                ...map,
                [key]: (map[key] || 0) + 1,
            };
        }, keysMap);
    }

    getKeysMap(latencies, groupingDistance) {
        const max = Math.max(...latencies.success, ...latencies.error);
        const min = Math.floor(Math.min(...latencies.success, ...latencies.error));
        const amount = Math.ceil((max - min) / groupingDistance);
        const keys = Array.from({ length: amount })
            .map((_, i) => (i === 0 ? min : min + (i * groupingDistance)));

        return keys.reduce((final, key) => ({ ...final, [key]: 0 }), {});
    }

    getChartsData(props) {
        const { measurements, groupingDistance } = props;
        const { latencies } = measurements;
        const keysMap = this.getKeysMap(latencies, groupingDistance);

        const successLatencyMap = this.getLatencyMap(keysMap, latencies.success, groupingDistance);
        const errorLatencyMap = this.getLatencyMap(keysMap, latencies.error, groupingDistance);

        return {
            labels: Object.keys(keysMap)
                .map(key => `${key}-${(parseInt(key) + groupingDistance) - 1}`),
            datasets: [
                {
                    label: 'Erroneous Requests',
                    backgroundColor: fade(Palette.accent1Color, 0.3),
                    borderWidth: 0,
                    data: Object.keys(errorLatencyMap)
                        .map(key => errorLatencyMap[key]),
                },
                {
                    label: 'Successful Requests',
                    backgroundColor: fade(Palette.primary1Color, 0.3),
                    borderWidth: 0,
                    data: Object.keys(successLatencyMap)
                        .map(key => successLatencyMap[key]),
                },
            ],
        };
    }

    getChartOptions(props) {
        return {
            responsive: true,
            title: {
                display: true,
                text: `Sequence Step #${props.sequenceIndex + 1}`,
                position: 'top',
            },
            legend: {
                position: 'top',
                labels: {
                    fontFamily: '\'Roboto\', sans-serif',
                    fontSize: 8,
                },
            },
            animation: {
                duration: 0,
            },
            scales: {
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Requests',
                            fontSize: 10,
                            fontStyle: 'bold',
                        },
                        ticks: {
                            fontSize: 8,
                        },
                        stacked: true,
                    },
                ],
                xAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Latency [ms]',
                            fontSize: 10,
                            fontStyle: 'bold',
                        },
                        categoryPercentage: 1.0,
                        barPercentage: 1.0,
                        gridLines: {
                            display: false,
                            lineWidth: 0,
                        },
                        ticks: {
                            fontSize: 8,
                        },
                        stacked: true,
                    },
                ],
            },
        };
    }

    render() {
        const styles = {
            container: {
                minWidth: 350,
                // maxWidth: '50%',
                maxWidth: 700,
                flex: 1,
                marginRight: 12,
                marginBottom: 12,
            },
        };
        return (
            <div style={styles.container}>
                <canvas id={this.canvasId} />
            </div>
        );
    }
}
