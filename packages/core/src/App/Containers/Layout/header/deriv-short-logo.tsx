import React from 'react';
import { StaticUrl } from '@deriv/components';
import LOGO from '../../../Logo/LOGO.png'; // Correct relative path

const DerivShortLogo = () => {
    return (
        <div className='header__menu-left-logo'>
            <StaticUrl href='/'>
                <img
                    src={LOGO}
                    alt='Deriv Short Logo'
                    style={{ height: '40px', width: 'auto' }}
                />
            </StaticUrl>
        </div>
    );
};

export default DerivShortLogo;

