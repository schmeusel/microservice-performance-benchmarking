import React from 'react';
import { shallow } from 'enzyme';
import MeasurementStatisticsElement
    from '../../../../../src/webServer/public/components/measurements/MeasurementStatisticsElement';

describe('Test MeasurementStatisticsElement', () => {
    it('should render a container with two spans inside', () => {
        const wrapper = shallow(
            <MeasurementStatisticsElement measurements={[1]} stat={'min'} />,
        );
        expect(wrapper.exists()).toBeTruthy();
        expect(wrapper.type()).toEqual('div');
        expect(wrapper.children()).toHaveLength(2);
        wrapper.children().forEach((child) => {
            expect(child.type()).toEqual('span');
        });
    });

    it('should calculate the min value for stat "min"', () => {
        const wrapper = shallow(
            <MeasurementStatisticsElement measurements={[1, 2, 3, 4, 5]} stat={'min'} />,
        );
        expect(wrapper.childAt(1).text()).toEqual('1.00ms');
    });

    it('should calculate the max value for stat "max"', () => {
        const wrapper = shallow(
            <MeasurementStatisticsElement measurements={[1, 2, 3, 4, 5]} stat={'max'} />,
        );
        expect(wrapper.childAt(1).text()).toEqual('5.00ms');
    });

    it('should calculate the mean value for stat "mean"', () => {
        const wrapper = shallow(
            <MeasurementStatisticsElement measurements={[1, 2, 3, 4, 5]} stat={'mean'} />,
        );
        expect(wrapper.childAt(1).text()).toEqual('3.00ms');
    });

    it('should calculate the lower quartile value for stat "q1"', () => {
        const wrapper = shallow(
            <MeasurementStatisticsElement measurements={[1, 2, 3, 4, 5]} stat={'q1'} />,
        );
        expect(wrapper.childAt(1).text()).toEqual('2.00ms');
    });

    it('should calculate the upper quartile value for stat "q3"', () => {
        const wrapper = shallow(
            <MeasurementStatisticsElement measurements={[1, 2, 3, 4, 5]} stat={'q3'} />,
        );
        expect(wrapper.childAt(1).text()).toEqual('4.00ms');
    });

    it('should calculate the standard deviation value for stat "stdv"', () => {
        const wrapper = shallow(
            <MeasurementStatisticsElement measurements={[1, 2, 3, 4, 5]} stat={'stdv'} />,
        );
        expect(wrapper.childAt(1).text()).toEqual('1.41ms');
    });
});
