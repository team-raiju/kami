let _showLog = $state(false);
let _hasNewError = $state(false);
let _hasNewWarning = $state(false);

export function showLog() {
  function toggle() {
    _showLog = !_showLog;
  }

  return {
    get showLog() {
      return _showLog;
    },
    toggle,
  };
}

export function newErrorState() {
  function clear() {
    _hasNewError = false;
    _hasNewWarning = false;
  }

  function setNewError() {
    _hasNewError = true;
  }

  function setNewWarning() {
    _hasNewWarning = true;
  }

  return {
    get hasNewError() {
      return _hasNewError;
    },
    get hasNewWarning() {
      return _hasNewWarning;
    },
    clear,
    setNewError,
    setNewWarning,
  };
}
