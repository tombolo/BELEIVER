import React from 'react';
import ReactDOM from 'react-dom';
import { Div100vhContainer, Icon, useOnClickOutside, Text } from '@deriv/components';
import { routes, getActivePlatform, platforms } from '@deriv/shared';
import { BinaryLink } from 'App/Components/Routes';
import 'Sass/app/_common/components/platform-dropdown.scss';
import { Localize } from '@deriv/translations';
import { useHistory } from 'react-router';
import { useDevice } from '@deriv-com/ui';
import { useIsHubRedirectionEnabled } from '@deriv/hooks';
import { useStore } from '@deriv/stores';

const PlatformBox = ({ platform: { icon, description } }) => (
    <React.Fragment>
        <div className='platform-dropdown__list-platform-background' />

        <div className='platform-switcher__dropdown' data-testid='dt_platform_box_icon'>
            <Icon icon={icon} height={42} width={150} description={icon} />
            <p className='platform-dropdown__list-platform-description'>{description()}</p>
        </div>
    </React.Fragment>
);
const appendAccountParamToUrl = (link_to, client) => {
    const { is_virtual, currency } = client;
    let url = link_to;

    if (is_virtual) {
        url = `${url}${url.includes('?') ? '&' : '?'}account=demo`;
    } else if (currency) {
        url = `${url}${url.includes('?') ? '&' : '?'}account=${currency}`;
    }

    // Add symbol parameter if available in session storage
    try {
        const trade_store = JSON.parse(sessionStorage.getItem('trade_store') || '{}');
        if (trade_store?.symbol) {
            url = `${url}${url.includes('?') ? '&' : '?'}symbol=${trade_store.symbol}`;
        }
    } catch (e) {
        // If parsing fails, continue without symbol
    }

    return url;
};

const PlatformDropdownContent = ({ platform, app_routing_history, client }) => {
    return (
        (platform.link_to && (
            <BinaryLink
                data-testid='dt_platform_dropdown'
                to={appendAccountParamToUrl(platform.link_to, client)}
                // This is here because in routes-config it needs to have children, but not in menu
                exact={platform.link_to === routes.trade}
                className='platform-dropdown__list-platform'
                isActive={() => getActivePlatform(app_routing_history) === platform.name}
                onClick={e => window.location.pathname.startsWith(platform.link_to) && e.preventDefault()}
            >
                <PlatformBox platform={platform} />
            </BinaryLink>
        )) || (
            <a
                data-testid='dt_platform_dropdown_link'
                href={appendAccountParamToUrl(platform.href, client)}
                className={`platform-dropdown__list-platform ${
                    getActivePlatform(app_routing_history) === platform.name ? 'active' : ''
                }`}
            >
                <PlatformBox platform={platform} />
            </a>
        )
    );
};

const PlatformDropdown = ({ app_routing_history, closeDrawer, platform_config, setTogglePlatformType }) => {
    const history = useHistory();
    const { isDesktop } = useDevice();
    const { isHubRedirectionEnabled } = useIsHubRedirectionEnabled();
    const { client } = useStore();
    const { has_wallet } = client;

    const TradersHubRedirect = () => {
        return (
            <div className='platform-dropdown__cta'>
                <BinaryLink
                    onClick={() => {
                        if (isHubRedirectionEnabled && has_wallet) {
                            localStorage.setItem('redirect_to_th_os', 'home');
                            window.location.assign(platforms.tradershub_os.url);
                            return;
                        }
                        if (!isDesktop) {
                            history.push(routes.traders_hub);
                            setTogglePlatformType('cfd');
                        }
                        history.push(routes.traders_hub);
                    }}
                >
                    <Text size='xs' weight='bold' align='center' className='platform-dropdown__cta--link'>
                        <Localize i18n_default_text="Looking for CFDs? Go to Trader's Hub" />
                    </Text>
                </BinaryLink>
            </div>
        );
    };

    React.useEffect(() => {
        window.addEventListener('popstate', closeDrawer);
        return () => {
            window.removeEventListener('popstate', closeDrawer);
        };
    }, [closeDrawer]);

    const ref = React.useRef();

    const handleClickOutside = event => {
        if (!event.target.closest('.platform-dropdown__list') && !event.target.closest('.platform-switcher')) {
            closeDrawer();
        }
    };

    useOnClickOutside(ref, handleClickOutside, () => isDesktop);

    const platform_dropdown = (
        <div className='platform-dropdown'>
            <Div100vhContainer className='platform-dropdown__list' height_offset='15rem' is_disabled={isDesktop}>
                {platform_config.map(platform => {
                    return (
                        <div key={platform.name} onClick={closeDrawer} ref={ref}>
                            <PlatformDropdownContent
                                platform={platform}
                                app_routing_history={app_routing_history}
                                client={client}
                            />
                        </div>
                    );
                })}
                <TradersHubRedirect />
            </Div100vhContainer>
        </div>
    );

    if (isDesktop) {
        return ReactDOM.createPortal(platform_dropdown, document.getElementById('deriv_app'));
    }

    return ReactDOM.createPortal(platform_dropdown, document.getElementById('mobile_platform_switcher'));
};

export { PlatformDropdown, PlatformBox };
