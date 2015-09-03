import { Component, PropTypes } from 'react';
import swal from 'sweetalert';
import pick from 'lodash.pick';
import mousetrap from 'mousetrap';
import warning from 'warning';
import outsideTargetHandlerFactory from './utils/outsideTargetHandlerFactory';

const ALLOWS_KEYS = [
  'title',
  'text',
  'type',
  'customClass',
  'showCancelButton',
  'showConfirmButton',
  'confirmButtonText',
  'confirmButtonColor',
  'cancelButtonText',
  'imageUrl',
  'imageSize',
  'html',
  'animation',
  'inputType',
  'inputPlaceholder',
  'showLoaderOnConfirm'
];

const REMOVED_KEYS = [
  'timer',
  'closeOnConfirm',
  'closeOnCancel',
  'allowOutsideClick',
  'allowEscapeKey'
];

const OVERWRITE_PROPS = {
  closeOnConfirm: false,
  closeOnCancel: false,
  allowOutsideClick: false,
  allowEscapeKey: false
};

// reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
const ALLOWS_INPUT_TYPES = [
  'button',
  'checkbox',
  'color',
  'date',
  'datetime',
  'datetime-local',
  'email',
  'file',
  'hidden',
  'image',
  'month',
  'number',
  'password',
  'radio',
  'range',
  'reset',
  'search',
  'submit',
  'tel',
  'text',
  'time',
  'url',
  'week'
];

export default class SweetAlert extends Component {
  static propTypes = {
    // sweetalert option
    title: PropTypes.string.isRequired,
    text: PropTypes.string,
    type: PropTypes.oneOf(['warning', 'error', 'success', 'info', 'input']),
    customClass: PropTypes.string,
    showCancelButton: PropTypes.bool,
    showConfirmButton: PropTypes.bool,
    confirmButtonText: PropTypes.string,
    confirmButtonColor: PropTypes.string,
    cancelButtonText: PropTypes.string,
    imageUrl: PropTypes.string,
    imageSize: (props, propName) => {
      if (!/^[1-9]\d*x[1-9]\d*/.test(props[propName])) {
        return new Error('imageSize should have the format like this: "80x80"');
      }
    },
    html: PropTypes.bool,
    animation: PropTypes.bool,
    inputType: PropTypes.oneOf(ALLOWS_INPUT_TYPES),
    inputPlaceholder: PropTypes.string,
    inputValue: PropTypes.string,
    showLoaderOnConfirm: PropTypes.bool,

    // custom option
    show: PropTypes.bool,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
    onEscapeKey: PropTypes.func,
    onOutsideClick: PropTypes.func
  }

  static defaultProps = {
    // sweetalert option
    title: null,
    text: null,
    type: null,
    customClass: null,
    showCancelButton: false,
    showConfirmButton: true,
    confirmButtonText: 'OK',
    confirmButtonColor: '#AEDEF4',
    cancelButtonText: 'Cancel',
    imageUrl: null,
    imageSize: '80x80',
    html: false,
    animation: true,
    inputType: 'text',
    inputPlaceholder: null,
    inputValue: null,
    showLoaderOnConfirm: false,

    // custom option
    show: false
  }

  constructor(props, context) {
    super(props, context);
    this._show = false;
  }

  componentDidMount() {
    this.setupWithProps(this.props);

    if (this.props.onOutsideClick) {
      this.registerOutsideClickHandler(this.props.onOutsideClick);
    }
  }

  componentWillReceiveProps(props) {
    this.setupWithProps(props);

    const oldOutsideClickHandler = this.props.onOutsideClick;
    const newOutsideClickHandler = props.onOutsideClick;

    if (oldOutsideClickHandler !== newOutsideClickHandler) {
      if (oldOutsideClickHandler && newOutsideClickHandler) {
        this.unregisterOutsideClickHandler();
        this.registerOutsideClickHandler(newOutsideClickHandler);
      } else if (oldOutsideClickHandler && !newOutsideClickHandler) {
        this.unregisterOutsideClickHandler();
      } else if ((!oldOutsideClickHandler) && newOutsideClickHandler) {
        this.registerOutsideClickHandler(newOutsideClickHandler);
      }
    }
  }

  componentWillUnmount() {
    this.disableOutsideClick();
    this._outsideClickHandler = false;
  }

  setupWithProps(props) {
    this.warningRemoved(props);
    const { show, onConfirm, onCancel, onClose, onEscapeKey } = props;
    if (show) {
      swal({
        ...pick(props, ALLOWS_KEYS),
        ...OVERWRITE_PROPS
      }, isConfirm => this.handleClick(isConfirm, onConfirm, onCancel));
      this._show = true;
      this.bindEscapeKey(onEscapeKey);
    } else {
      this.handleClose(onClose, onEscapeKey);
    }
  }

  warningRemoved(props) {
    REMOVED_KEYS.forEach(key => {
      warning(
        props[key] === undefined,
        '%s has been removed from sweetalert-react, pass `show` props and use event hook instead.',
        '`' + key + '`'
      );
    });
  }

  registerOutsideClickHandler(handler) {
    this._outsideClickHandler = outsideTargetHandlerFactory(
      document.getElementsByClassName('sweet-alert'),
      handler
    );
    this.enableOutsideClick();
  }

  unregisterOutsideClickHandler() {
    this.disableOutsideClick();
    this._outsideClickHandler = null;
  }

  enableOutsideClick() {
    const fn = this._outsideClickHandler;
    document.addEventListener('mousedown', fn);
    document.addEventListener('touchstart', fn);
  }

  disableOutsideClick() {
    const fn = this._outsideClickHandler;
    document.removeEventListener('mousedown', fn);
    document.removeEventListener('touchstart', fn);
  }

  bindEscapeKey(onEscapeKey) {
    onEscapeKey && mousetrap.bind('esc', onEscapeKey);
  }

  unbindEscapeKey(onEscapeKey) {
    onEscapeKey && mousetrap.unbind('esc', onEscapeKey);
  }

  handleClick(isConfirm, onConfirm, onCancel) {
    if (isConfirm) {
      onConfirm && onConfirm(isConfirm);
    } else {
      onCancel && onCancel();
    }
  }

  handleClose(onClose, onEscapeKey) {
    if (this._show) {
      swal.close();
      this.unbindEscapeKey(onEscapeKey);
      onClose && onClose();
      this._show = false;
    }
  }

  render() {
    return null;
  }
}
