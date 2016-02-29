
export default function postPreferences(params = {}) {

    return fetch('/prefs',
          { method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(params)
    })
    .then(res => res.json())
}
