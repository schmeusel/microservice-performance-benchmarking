import React from 'react';
import { shallow } from 'enzyme';
import MeasurementStatistics from '../../../../../src/webServer/public/components/measurements/MeasurementStatistics';
import { Palette } from '../../../../../src/webServer/public/constants/Theme';

describe('Test MeasurementStatistics', () => {
    it('should return null if the measurements array is empty', () => {
        const wrapper = shallow(
            <MeasurementStatistics type={'success'} measurements={[]} />,
        );
        expect(wrapper.type()).toBeNull();
    });

    it('should render a primary color background for success', () => {
        const wrapper = shallow(
            <MeasurementStatistics type={'success'} measurements={[1]} />,
        );
        expect(wrapper.prop('style').backgroundColor).toEqual(Palette.primary1Color);
    });

    it('should render an accent color background for error', () => {
        const wrapper = shallow(
            <MeasurementStatistics type={'error'} measurements={[1]} />,
        );
        expect(wrapper.prop('style').backgroundColor).toEqual(Palette.accent1Color);
    });

    it('should render 6 MeasurementStatisticsElements', () => {
        const wrapper = shallow(
            <MeasurementStatistics type={'success'} measurements={[1]} />,
        );
        expect(wrapper.find('MeasurementStatisticsElement')).toHaveLength(6);
    });

    it('should render MeasurementStatisticsElements for "min, max, q1, q3, mean, stdv"', () => {
        const wrapper = shallow(
            <MeasurementStatistics type={'success'} measurements={[1]} />,
        );
        expect(wrapper.find('MeasurementStatisticsElement[stat="min"]')).toHaveLength(1);
        expect(wrapper.find('MeasurementStatisticsElement[stat="max"]')).toHaveLength(1);
        expect(wrapper.find('MeasurementStatisticsElement[stat="q1"]')).toHaveLength(1);
        expect(wrapper.find('MeasurementStatisticsElement[stat="q3"]')).toHaveLength(1);
        expect(wrapper.find('MeasurementStatisticsElement[stat="mean"]')).toHaveLength(1);
        expect(wrapper.find('MeasurementStatisticsElement[stat="stdv"]')).toHaveLength(1);
    });
});
